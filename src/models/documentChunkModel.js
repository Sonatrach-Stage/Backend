import pool from "../config/db.js";

const DocumentChunk = {
  create: async ({
    documentId,
    versionId,
    chunkText,
    chunkNumber,
    pageNumber,
    embedding,
  }) => {
    const result = await pool.query(
      `
      INSERT INTO document_chunks (
        document_id,
        version_id,
        chunk_text,
        chunk_number,
        page_number,
        embedding
      )
      VALUES ($1, $2, $3, $4, $5, $6::vector)
      RETURNING *
      `,
      [
        documentId,
        versionId,
        chunkText,
        chunkNumber,
        pageNumber,
        JSON.stringify(embedding),
      ]
    );

    return result.rows[0];
  },
searchSimilar: async (
  embedding,
  companyId,
  limit = 5
) => {

  const result = await pool.query(
    `
    SELECT
      dc.id,
      dc.document_id,
      dc.version_id,
      dc.chunk_number,
      dc.page_number,
      dc.chunk_text,

      d.title AS document_title,
      u.name AS author_name,

      1 - (dc.embedding <=> $1::vector) AS similarity

    FROM document_chunks dc

    JOIN documents d
      ON dc.document_id = d.id

    JOIN document_versions dv
      ON dc.version_id = dv.id

    JOIN intern i
      ON d.intern_id = i.id

    JOIN users u
      ON i.user_id = u.id

    WHERE dc.embedding IS NOT NULL

      --  Ressources de la même entreprise uniquement
      AND i.company_id = $2

      -- Documents finaux uniquement
      AND d.document_type IN (
        'FINAL_THESIS',
        'FINAL_REPORT'
      )

      -- Version approuvée
      AND EXISTS (
        SELECT 1
        FROM document_reviews dr
        WHERE dr.version_id = dv.id
          AND dr.status = 'APPROVED'
      )

      -- Dernière version approuvée
      AND dv.version_number = (
        SELECT MAX(dv2.version_number)
        FROM document_versions dv2

        WHERE dv2.document_id = d.id

          AND EXISTS (
            SELECT 1
            FROM document_reviews dr2
            WHERE dr2.version_id = dv2.id
              AND dr2.status = 'APPROVED'
          )
      )

    ORDER BY dc.embedding <=> $1::vector

    LIMIT $3
    `,
    [
      JSON.stringify(embedding),
      companyId,
      limit,
    ]
  );

  return result.rows;
},
findByDocument: async (
  documentId,
  companyId
) => {

  const result = await pool.query(
    `
    SELECT
      dc.id,
      dc.document_id,
      dc.version_id,
      dc.chunk_number,
      dc.page_number,
      dc.chunk_text,

      d.title AS document_title,
      u.name AS author_name

    FROM document_chunks dc

    JOIN documents d
      ON dc.document_id = d.id

    JOIN document_versions dv
      ON dc.version_id = dv.id

    JOIN intern i
      ON d.intern_id = i.id

    JOIN users u
      ON i.user_id = u.id

    WHERE dc.document_id = $1

      AND i.company_id = $2

      AND d.document_type IN (
        'FINAL_THESIS',
        'FINAL_REPORT'
      )

      AND EXISTS (
        SELECT 1
        FROM document_reviews dr
        WHERE dr.version_id = dv.id
          AND dr.status = 'APPROVED'
      )

      AND dv.version_number = (
        SELECT MAX(dv2.version_number)
        FROM document_versions dv2

        WHERE dv2.document_id = d.id

          AND EXISTS (
            SELECT 1
            FROM document_reviews dr2
            WHERE dr2.version_id = dv2.id
              AND dr2.status = 'APPROVED'
          )
      )

    ORDER BY dc.chunk_number ASC
    `,
    [
      documentId,
      companyId
    ]
  );

  return result.rows;
},
findSimilarDocuments: async (
  documentId,
  companyId,
  limit = 5
) => {

  const result = await pool.query(
    `
    WITH source_chunks AS (

      SELECT
        embedding

      FROM document_chunks dc

      JOIN documents d
        ON dc.document_id = d.id

      JOIN intern i
        ON d.intern_id = i.id

      JOIN document_versions dv
        ON dc.version_id = dv.id

      WHERE dc.document_id = $1

        AND i.company_id = $2

        AND dc.embedding IS NOT NULL

        AND d.document_type IN (
          'FINAL_THESIS',
          'FINAL_REPORT'
        )

        AND EXISTS (
          SELECT 1
          FROM document_reviews dr
          WHERE dr.version_id = dv.id
            AND dr.status = 'APPROVED'
        )

    ),

    similar_chunks AS (

      SELECT
        dc.document_id,
        AVG(
          1 - (
            dc.embedding <=> sc.embedding
          )
        ) AS similarity

      FROM document_chunks dc

      CROSS JOIN source_chunks sc

      JOIN documents d
        ON dc.document_id = d.id

      JOIN intern i
        ON d.intern_id = i.id

      JOIN document_versions dv
        ON dc.version_id = dv.id

      WHERE dc.document_id != $1

        AND i.company_id = $2

        AND dc.embedding IS NOT NULL

        AND d.document_type IN (
          'FINAL_THESIS',
          'FINAL_REPORT'
        )

        AND EXISTS (
          SELECT 1
          FROM document_reviews dr
          WHERE dr.version_id = dv.id
            AND dr.status = 'APPROVED'
        )

      GROUP BY dc.document_id
    )

    SELECT
      sd.document_id,
      d.title AS document_title,
      u.name AS author_name,
      sd.similarity

    FROM similar_chunks sd

    JOIN documents d
      ON sd.document_id = d.id

    JOIN intern i
      ON d.intern_id = i.id

    JOIN users u
      ON i.user_id = u.id

    ORDER BY sd.similarity DESC

    LIMIT $3
    `,
    [
      documentId,
      companyId,
      limit
    ]
  );

  return result.rows;
},
};

export default DocumentChunk;