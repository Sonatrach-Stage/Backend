import pool from "../config/db.js";

const DocumentVersion = {

  // Ajouter une nouvelle version
create: async (data) => {
  const result = await pool.query(
    `INSERT INTO document_versions
     (
       document_id,
       version_number,
       file_name,
       file_url,
       public_id,
       resource_type,
       file_content,
       uploaded_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.document_id,
      data.version_number,
      data.file_name,
      data.file_url,
      data.public_id,
      data.resource_type,
      data.file_content,
      data.uploaded_by
    ]
  );

  return result.rows[0];
},

  // Récupérer toutes les versions d'un document
  findByDocument: async (documentId) => {
    const result = await pool.query(
      `SELECT *
       FROM document_versions
       WHERE document_id = $1
       ORDER BY version_number ASC`,
      [documentId]
    );

    return result.rows;
  },

  // Récupérer la dernière version
  findLatest: async (documentId) => {
    const result = await pool.query(
      `SELECT *
       FROM document_versions
       WHERE document_id = $1
       ORDER BY version_number DESC
       LIMIT 1`,
      [documentId]
    );

    return result.rows[0];
  },
  findById: async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM document_versions
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
},


};

export default DocumentVersion;