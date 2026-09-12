import pool from "../config/db.js";

const PendingRegistration = {

  async upsert({
    email,
    type,
    payload,
    expiresInMinutes = 15,
  }) {

    const expires_at = new Date(
      Date.now() + expiresInMinutes * 60 * 1000
    );

    await pool.query(
      `
      INSERT INTO pending_registrations (
        email,
        type,
        payload,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET
        type = EXCLUDED.type,
        payload = EXCLUDED.payload,
        expires_at = EXCLUDED.expires_at
      `,
      [
        email,
        type,
        JSON.stringify(payload),
        expires_at,
      ]
    );
  },


  async findValid(email) {

    const result = await pool.query(
      `
      SELECT *
      FROM pending_registrations
      WHERE email = $1
        AND expires_at > NOW()
      `,
      [email]
    );

    return result.rows[0] || null;
  },


  async delete(email) {

    await pool.query(
      `
      DELETE FROM pending_registrations
      WHERE email = $1
      `,
      [email]
    );
  },
};

export default PendingRegistration;