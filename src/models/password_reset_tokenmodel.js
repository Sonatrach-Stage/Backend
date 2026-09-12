import pool from "../config/db.js";

const PasswordResetToken = {

  // =====================================================
  // CREATE TOKEN
  // =====================================================

  create: async (user_id, token, expired_at) => {
    const result = await pool.query(
      `
      INSERT INTO password_reset_tokens
      (
        user_id,
        token,
        expired_at,
        used,
        created_at,
        is_verified
      )
      VALUES ($1, $2, $3, FALSE, NOW(), FALSE)
      RETURNING id
      `,
      [user_id, token, expired_at]
    );

    return result.rows[0].id;
  },


  // =====================================================
  // FIND TOKEN
  // =====================================================

  findByToken: async (token) => {
    const result = await pool.query(
      `
      SELECT *
      FROM password_reset_tokens
      WHERE token = $1
        AND used = FALSE
        AND expired_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [token]
    );

    return result.rows[0] || null;
  },


  // =====================================================
  // MARK TOKEN AS VERIFIED
  // =====================================================

  markAsVerified: async (token) => {
    const result = await pool.query(
      `
      UPDATE password_reset_tokens
      SET is_verified = TRUE
      WHERE token = $1
      `,
      [token]
    );

    return result.rowCount;
  },


  // =====================================================
  // FIND VERIFIED TOKEN
  // =====================================================

  findVerifiedById: async (user_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM password_reset_tokens
      WHERE user_id = $1
        AND is_verified = TRUE
        AND used = FALSE
        AND expired_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [user_id]
    );

    return result.rows[0] || null;
  },


  // =====================================================
  // MARK TOKEN AS USED
  // =====================================================

  markAsUsed: async (token) => {
    const result = await pool.query(
      `
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE token = $1
      `,
      [token]
    );

    return result.rowCount;
  },


  // =====================================================
  // DELETE TOKENS OF USER
  // =====================================================

  deleteByUserId: async (user_id) => {
    const result = await pool.query(
      `
      DELETE FROM password_reset_tokens
      WHERE user_id = $1
      `,
      [user_id]
    );

    return result.rowCount;
  },

};

export default PasswordResetToken;