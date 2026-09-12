import pool from '../config/db.js';

const EmailOtp = {

  // Créer un nouveau code OTP
  async create({ email, otp_code, expiresInMinutes = 10 }) {
    const result = await pool.query(
      `INSERT INTO email_otp_verifications
       (email, otp_code, expires_at)
       VALUES (
         $1,
         $2,
         NOW() + ($3 * INTERVAL '1 minute')
       )
       RETURNING id`,
      [email, otp_code, expiresInMinutes]
    );

    return result.rows[0].id;
  },


  // Rechercher un OTP valide
  async findValid({ email, otp_code }) {
    const result = await pool.query(
      `SELECT *
       FROM email_otp_verifications
       WHERE email = $1
         AND otp_code = $2
         AND used = FALSE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email, otp_code]
    );

    return result.rows[0] || null;
  },


  // Marquer l'OTP comme utilisé
  async markUsed(id) {
    await pool.query(
      `UPDATE email_otp_verifications
       SET used = TRUE
       WHERE id = $1`,
      [id]
    );
  },


  // Supprimer les OTP d'un email
  async deleteByEmail(email) {
    await pool.query(
      `DELETE FROM email_otp_verifications
       WHERE email = $1`,
      [email]
    );
  },

};

export default EmailOtp;

