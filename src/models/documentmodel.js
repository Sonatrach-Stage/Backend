import pool from "../config/db.js";

const Document = {

  // Créer un document
  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO documents
       (intern_id, task_id, title, description, document_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.intern_id,
        data.task_id,
        data.title,
        data.description,
        data.document_type
      ]
    );

    return result.rows[0];
  },

  // Récupérer tous les documents d'un stagiaire
  findByIntern: async (internId) => {
    const result = await pool.query(
      `SELECT *
       FROM documents
       WHERE intern_id = $1
       ORDER BY created_at DESC`,
      [internId]
    );

    return result.rows;
  },

  // Récupérer un document
  findById: async (id) => {
    const result = await pool.query(
      `SELECT *
       FROM documents
       WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  },

  // Documents qui nécessitent une attention de l'encadrant
findPendingBySupervisor: async (supervisorId) => {
  const result = await pool.query(
    `SELECT
       d.id,
       d.title,
       d.description,
       d.document_type,
       d.status,
       d.task_id,
       d.created_at,
       d.updated_at,

       i.id AS intern_id,
       u.name AS intern_name,
       u.email AS intern_email,

       v.id AS version_id,
       v.version_number,
       v.file_name,
       v.file_url,
       v.created_at AS version_created_at

     FROM documents d

     JOIN intern i
       ON d.intern_id = i.id

     JOIN users u
       ON i.user_id = u.id

     LEFT JOIN document_versions v
       ON v.id = (
         SELECT v2.id
         FROM document_versions v2
         WHERE v2.document_id = d.id
         ORDER BY v2.version_number DESC
         LIMIT 1
       )

     WHERE i.supervisor_id = $1
       AND d.status = 'PENDING'

     ORDER BY d.created_at DESC`,
    [supervisorId]
  );

  return result.rows;
},
update: async (id, data) => {
  const result = await pool.query(
    `UPDATE documents
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         document_type = COALESCE($3, document_type),
         task_id = COALESCE($4, task_id),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [
      data.title,
      data.description,
      data.document_type,
      data.task_id,
      id
    ]
  );

  return result.rows[0];
},
delete: async (id) => {
  await pool.query(
    `DELETE FROM documents
     WHERE id = $1`,
    [id]
  );
},
findBySupervisor: async (supervisorId, documentId) => {
  const result = await pool.query(
    `SELECT d.*
     FROM documents d
     JOIN intern i
       ON d.intern_id = i.id
     WHERE d.id = $1
       AND i.supervisor_id = $2`,
    [documentId, supervisorId]
  );

  return result.rows[0];
},
  // Modifier le statut
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE documents
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  },
  searchByIntern: async (internId, search) => {
  const result = await pool.query(
    `SELECT DISTINCT
       d.*,

       v.id AS version_id,
       v.version_number,
       v.file_name,
       v.file_url,

       GREATEST(

         -- =========================
         -- TITRE
         -- =========================

         CASE
           WHEN lower(d.title) = lower($2)
             THEN 1.0

           WHEN d.title ILIKE '%' || $2 || '%'
             THEN 0.9

           WHEN length($2) >= 4
                AND similarity(
                  lower(d.title),
                  lower($2)
                ) > 0.3
             THEN similarity(
               lower(d.title),
               lower($2)
             )

           ELSE 0
         END,

         -- =========================
         -- DESCRIPTION
         -- =========================

         CASE
           WHEN COALESCE(d.description, '') ILIKE '%' || $2 || '%'
             THEN 0.7

           WHEN length($2) >= 4
                AND similarity(
                  lower(COALESCE(d.description, '')),
                  lower($2)
                ) > 0.3
             THEN similarity(
               lower(COALESCE(d.description, '')),
               lower($2)
             )

           ELSE 0
         END,

         -- =========================
         -- NOM DU FICHIER + CONTENU
         -- =========================

         COALESCE(
           (
             SELECT MAX(
               GREATEST(

                 -- Nom du fichier
                 CASE
                   WHEN COALESCE(sv.file_name, '') ILIKE '%' || $2 || '%'
                     THEN 0.8

                   WHEN length($2) >= 4
                        AND similarity(
                          lower(COALESCE(sv.file_name, '')),
                          lower($2)
                        ) > 0.3
                     THEN similarity(
                       lower(COALESCE(sv.file_name, '')),
                       lower($2)
                     )

                   ELSE 0
                 END,

                 -- Contenu exact
                 CASE
                   WHEN COALESCE(sv.file_content, '') ILIKE '%' || $2 || '%'
                     THEN 0.6

                   ELSE 0
                 END,

                 -- Contenu fuzzy mot par mot
                 COALESCE(
                   (
                     SELECT MAX(
                       similarity(
                         lower(word),
                         lower($2)
                       )
                     )

                     FROM regexp_split_to_table(
                       sv.file_content,
                       '\\s+'
                     ) AS word

                     WHERE length($2) >= 4
                   ),
                   0
                 )

               )
             )

             FROM document_versions sv
             WHERE sv.document_id = d.id
           ),
           0
         )

       ) AS relevance_score

     FROM documents d

     -- =========================
     -- DERNIÈRE VERSION
     -- =========================

     LEFT JOIN LATERAL (
       SELECT *
       FROM document_versions v2
       WHERE v2.document_id = d.id
       ORDER BY v2.version_number DESC
       LIMIT 1
     ) v ON true

     -- =========================
     -- SÉCURITÉ
     -- =========================

     WHERE d.intern_id = $1

     AND (

       -- =========================
       -- RECHERCHE NORMALE
       -- =========================

       d.title ILIKE '%' || $2 || '%'

       OR COALESCE(d.description, '') ILIKE '%' || $2 || '%'

       OR EXISTS (
         SELECT 1
         FROM document_versions sv
         WHERE sv.document_id = d.id

         AND (
           COALESCE(sv.file_name, '') ILIKE '%' || $2 || '%'

           OR COALESCE(sv.file_content, '') ILIKE '%' || $2 || '%'
         )
       )

       -- =========================
       -- FUZZY TITRE
       -- =========================

       OR (
         length($2) >= 4

         AND similarity(
           lower(d.title),
           lower($2)
         ) > 0.3
       )

       -- =========================
       -- FUZZY DESCRIPTION
       -- =========================

       OR (
         length($2) >= 4

         AND similarity(
           lower(COALESCE(d.description, '')),
           lower($2)
         ) > 0.3
       )

       -- =========================
       -- FUZZY CONTENU
       -- =========================

       OR EXISTS (
         SELECT 1
         FROM document_versions fv

         CROSS JOIN LATERAL regexp_split_to_table(
           fv.file_content,
           '\\s+'
         ) AS word

         WHERE fv.document_id = d.id

         AND length($2) >= 4

         AND similarity(
           lower(word),
           lower($2)
         ) > 0.3
       )

     )

     -- =========================
     -- TRI PAR PERTINENCE
     -- =========================

     ORDER BY relevance_score DESC,
              d.updated_at DESC`,
    [internId, search]
  );

  return result.rows;
},
searchBySupervisor: async (supervisorId, search) => {
  const result = await pool.query(
    `SELECT DISTINCT
       d.*,

       i.id AS intern_id,
       u.name AS intern_name,

       v.id AS version_id,
       v.version_number,
       v.file_name,
       v.file_url,

       GREATEST(

         -- =========================
         -- TITRE
         -- =========================

         CASE
           WHEN lower(d.title) = lower($2)
             THEN 1.0

           WHEN d.title ILIKE '%' || $2 || '%'
             THEN 0.9

           WHEN length($2) >= 4
                AND similarity(
                  lower(d.title),
                  lower($2)
                ) > 0.3
             THEN similarity(
               lower(d.title),
               lower($2)
             )

           ELSE 0
         END,

         -- =========================
         -- DESCRIPTION
         -- =========================

         CASE
           WHEN COALESCE(d.description, '') ILIKE '%' || $2 || '%'
             THEN 0.7

           WHEN length($2) >= 4
                AND similarity(
                  lower(COALESCE(d.description, '')),
                  lower($2)
                ) > 0.3
             THEN similarity(
               lower(COALESCE(d.description, '')),
               lower($2)
             )

           ELSE 0
         END,

         -- =========================
         -- NOM DU FICHIER + CONTENU
         -- =========================

         COALESCE(
           (
             SELECT MAX(
               GREATEST(

                 -- Nom du fichier
                 CASE
                   WHEN COALESCE(sv.file_name, '') ILIKE '%' || $2 || '%'
                     THEN 0.8

                   WHEN length($2) >= 4
                        AND similarity(
                          lower(COALESCE(sv.file_name, '')),
                          lower($2)
                        ) > 0.3
                     THEN similarity(
                       lower(COALESCE(sv.file_name, '')),
                       lower($2)
                     )

                   ELSE 0
                 END,

                 -- Contenu exact
                 CASE
                   WHEN COALESCE(sv.file_content, '') ILIKE '%' || $2 || '%'
                     THEN 0.6

                   ELSE 0
                 END,

                 -- Contenu fuzzy mot par mot
                 COALESCE(
                   (
                     SELECT MAX(
                       similarity(
                         lower(word),
                         lower($2)
                       )
                     )

                     FROM regexp_split_to_table(
                       sv.file_content,
                       '\\s+'
                     ) AS word

                     WHERE length($2) >= 4
                   ),
                   0
                 )

               )
             )

             FROM document_versions sv
             WHERE sv.document_id = d.id
           ),
           0
         )

       ) AS relevance_score

     FROM documents d

     JOIN intern i
       ON d.intern_id = i.id

     JOIN users u
       ON i.user_id = u.id

     -- =========================
     -- DERNIÈRE VERSION
     -- =========================

     LEFT JOIN LATERAL (
       SELECT *
       FROM document_versions v2
       WHERE v2.document_id = d.id
       ORDER BY v2.version_number DESC
       LIMIT 1
     ) v ON true

     -- =========================
     -- SÉCURITÉ
     -- =========================

     WHERE i.supervisor_id = $1

     AND (

       -- =========================
       -- RECHERCHE NORMALE
       -- =========================

       d.title ILIKE '%' || $2 || '%'

       OR COALESCE(d.description, '') ILIKE '%' || $2 || '%'

       OR EXISTS (
         SELECT 1
         FROM document_versions sv
         WHERE sv.document_id = d.id

         AND (
           COALESCE(sv.file_name, '') ILIKE '%' || $2 || '%'

           OR COALESCE(sv.file_content, '') ILIKE '%' || $2 || '%'
         )
       )

       -- =========================
       -- RECHERCHE FUZZY TITRE
       -- =========================

       OR (
         length($2) >= 4

         AND similarity(
           lower(d.title),
           lower($2)
         ) > 0.3
       )

       -- =========================
       -- RECHERCHE FUZZY DESCRIPTION
       -- =========================

       OR (
         length($2) >= 4

         AND similarity(
           lower(COALESCE(d.description, '')),
           lower($2)
         ) > 0.3
       )

       -- =========================
       -- RECHERCHE FUZZY CONTENU
       -- =========================

       OR EXISTS (
         SELECT 1

         FROM document_versions fv

         CROSS JOIN LATERAL regexp_split_to_table(
           fv.file_content,
           '\\s+'
         ) AS word

         WHERE fv.document_id = d.id

         AND length($2) >= 4

         AND similarity(
           lower(word),
           lower($2)
         ) > 0.3
       )

     )

     -- =========================
     -- TRI PAR PERTINENCE
     -- =========================

     ORDER BY relevance_score DESC,
              d.updated_at DESC`,
    [supervisorId, search]
  );

  return result.rows;
},
};

export default Document;