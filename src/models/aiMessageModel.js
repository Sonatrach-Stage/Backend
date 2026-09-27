import pool from "../config/db.js";

const AIMessage = {

  create: async (conversationId, role, content) => {
    const result = await pool.query(
      `
      INSERT INTO ai_messages (
        conversation_id,
        role,
        content
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        conversationId,
        role,
        content,
      ]
    );

    return result.rows[0];
  },

findRecentByConversation: async (
  conversationId,
  limit = 10
) => {

  const result = await pool.query(
    `
    SELECT *
    FROM (
      SELECT *
      FROM ai_messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    ) recent_messages

    ORDER BY created_at ASC
    `,
    [
      conversationId,
      limit
    ]
  );

  return result.rows;
},
  deleteByConversation: async (conversationId) => {
    await pool.query(
      `
      DELETE FROM ai_messages
      WHERE conversation_id = $1
      `,
      [conversationId]
    );
  },
  findByConversation: async (conversationId) => {

  const result = await pool.query(
    `
    SELECT *
    FROM ai_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
    `,
    [conversationId]
  );

  return result.rows;
},
};

export default AIMessage;