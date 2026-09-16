import pool from "../config/db.js";

const Message = {

  // ==========================================
  // CREATE MESSAGE
  // ==========================================

  create: async (conversation_id, sender_id, content) => {

    const result = await pool.query(
      `
      INSERT INTO messages
      (conversation_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [conversation_id, sender_id, content]
    );

    return result.rows[0];
  },


  // ==========================================
  // GET MESSAGES
  // ==========================================

  findByConversation: async (conversation_id) => {

    const result = await pool.query(
      `
      SELECT
        m.*,
        u.name AS sender_name,
        u.profil_image AS sender_image
      FROM messages m
      JOIN users u
        ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [conversation_id]
    );

    return result.rows;
  },


  // ==========================================
  // MARK AS READ
  // ==========================================

  markAsRead: async (conversation_id, user_id) => {

    const result = await pool.query(
      `
      UPDATE messages
      SET is_read = TRUE
      WHERE conversation_id = $1
      AND sender_id != $2
      AND is_read = FALSE
      `,
      [conversation_id, user_id]
    );

    return result.rowCount;
  },


  // ==========================================
  // DELETE MESSAGE
  // ==========================================

  delete: async (message_id, sender_id) => {

    const result = await pool.query(
      `
      DELETE FROM messages
      WHERE id = $1
      AND sender_id = $2
      RETURNING *
      `,
      [message_id, sender_id]
    );

    return result.rows[0];
  },
  // ==========================================
// UPDATE MESSAGE
// ==========================================

update: async (message_id, sender_id, content) => {

  const result = await pool.query(
    `
    UPDATE messages
    SET content = $1
    WHERE id = $2
    AND sender_id = $3
    RETURNING *
    `,
    [content, message_id, sender_id]
  );

  return result.rows[0];
}

};

export default Message;