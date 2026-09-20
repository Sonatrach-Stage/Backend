import pool from "../config/db.js";

const DocumentReview = {

  // Créer un review
  create: async (data) => {
    const result = await pool.query(
      `INSERT INTO document_reviews
       (document_id, version_id, supervisor_id, comment, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.document_id,
        data.version_id,
        data.supervisor_id,
        data.comment,
        data.status
      ]
    );

    return result.rows[0];
  },

  // Récupérer les reviews d'un document
  findByDocument: async (documentId) => {
    const result = await pool.query(
      `SELECT *
       FROM document_reviews
       WHERE document_id = $1
       ORDER BY created_at DESC`,
      [documentId]
    );

    return result.rows;
  },

  // Récupérer les reviews d'une version
  findByVersion: async (versionId) => {
    const result = await pool.query(
      `SELECT *
       FROM document_reviews
       WHERE version_id = $1
       ORDER BY created_at DESC`,
      [versionId]
    );

    return result.rows;
  }

};

export default DocumentReview;