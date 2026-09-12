import pool from '../config/db.js';

const RefreshToken = {

  // Créer un nouveau Refresh Token
  create: async (user_id, token, expires_at) => {
    const result = await pool.query(
      `INSERT INTO refresh_tokens
       (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [user_id, token, expires_at]
    );

    return result.rows[0].id;
  },


  // Rechercher un Refresh Token valide
  findByToken: async (token) => {
    const result = await pool.query(
      `SELECT *
       FROM refresh_tokens
       WHERE token = $1
         AND expires_at > NOW()`,
      [token]
    );

    return result.rows[0] || null;
  },


  // Supprimer un Refresh Token précis
 deleteByToken: async (token) => {
    const result = await pool.query(
      `DELETE FROM refresh_tokens
       WHERE token = $1
       RETURNING id`,
      [token]
    );

    return result.rowCount > 0;
  },


  // Supprimer tous les Refresh Tokens d'un utilisateur
  deleteByUserId: async (user_id) => {
    const result = await pool.query(
      `DELETE FROM refresh_tokens
       WHERE user_id = $1`,
      [user_id]
    );

    return result.rowCount;
  },

};

export default RefreshToken;