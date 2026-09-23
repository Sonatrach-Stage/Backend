import pool from "../config/db.js";

const Notification = {

  // ==========================================
  // CREATE
  // ==========================================

  create: async ({
    user_id,
    title,
    message,
    type,
  }) => {

    const result = await pool.query(
      `INSERT INTO notifications (
        user_id,
        title,
        message,
        type
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        user_id,
        title,
        message,
        type,
      ]
    );

    return result.rows[0];
  },


  // ==========================================
  // GET USER NOTIFICATIONS
  // ==========================================

  findByUser: async (userId) => {

    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  },


  // ==========================================
  // GET UNREAD NOTIFICATIONS
  // ==========================================

  findUnreadByUser: async (userId) => {

    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE user_id = $1
       AND is_read = FALSE
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  },


  // ==========================================
  // MARK AS READ
  // ==========================================

  markAsRead: async (notificationId, userId) => {

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [
        notificationId,
        userId,
      ]
    );

    return result.rows[0];
  },


  // ==========================================
  // MARK ALL AS READ
  // ==========================================

  markAllAsRead: async (userId) => {

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1
       AND is_read = FALSE
       RETURNING *`,
      [userId]
    );

    return result.rows;
  },


  // ==========================================
  // DELETE
  // ==========================================

  delete: async (notificationId, userId) => {

    const result = await pool.query(
      `DELETE FROM notifications
       WHERE id = $1
       AND user_id = $2
       RETURNING *`,
      [
        notificationId,
        userId,
      ]
    );

    return result.rows[0];
  },


  // ==========================================
  // COUNT UNREAD
  // ==========================================

  countUnread: async (userId) => {

    const result = await pool.query(
      `SELECT COUNT(*) AS count
       FROM notifications
       WHERE user_id = $1
       AND is_read = FALSE`,
      [userId]
    );

    return Number(result.rows[0].count);
  },
};

export default Notification;