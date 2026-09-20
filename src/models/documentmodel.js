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
  }

};

export default Document;