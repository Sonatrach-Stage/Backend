import pool from "../config/db.js";

const AIConversation = {

  create: async (userId, title = null) => {
    const result = await pool.query(
      `
      INSERT INTO ai_conversations (
        user_id,
        title
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, title]
    );

    return result.rows[0];
  },

  findById: async (id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM ai_conversations
      WHERE id = $1
      `,
      [id]
    );

    return result.rows[0];
  },

  findByUser: async (userId) => {
    const result = await pool.query(
      `
      SELECT *
      FROM ai_conversations
      WHERE user_id = $1
      ORDER BY updated_at DESC
      `,
      [userId]
    );

    return result.rows;
  },

  updateTitle: async (id, title) => {
    const result = await pool.query(
      `
      UPDATE ai_conversations
      SET
        title = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [title, id]
    );

    return result.rows[0];
  },

  updateTimestamp: async (id) => {
    const result = await pool.query(
      `
      UPDATE ai_conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  },

  delete: async (id) => {
    await pool.query(
      `
      DELETE FROM ai_conversations
      WHERE id = $1
      `,
      [id]
    );
  },
};

export default AIConversation;