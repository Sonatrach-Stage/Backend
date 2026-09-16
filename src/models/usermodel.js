import pool from "../config/db.js";

const User = {
  findById: async (id) => {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  },
activate: async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = TRUE
     WHERE id = $1
     RETURNING id, is_active`,
    [userId]
  );

  return result.rows[0];
},

deactivate: async (userId) => {
  const result = await pool.query(
    `UPDATE users
     SET is_active = FALSE
     WHERE id = $1
     RETURNING id, is_active`,
    [userId]
  );

  return result.rows[0];
},
  findByEmail: async (email) => {
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    return result.rows[0];
  },
create: async (userData) => {
  const {
    name,
    email,
    phone,
    password,
    profil_image,
    profil_image_public_id,
    is_active
  } = userData;

  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      phone,
      password,
      profil_image,
      profil_image_public_id,
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [
      name,
      email,
      phone,
      password,
      profil_image,
      profil_image_public_id,
      is_active
    ]
  );

  return result.rows[0];
},
  update: async (id, data) => {
    const result = await pool.query(
      `
      UPDATE users
      SET
        name = $1,
        email = $2,
        phone = $3,
        is_verified = $4,
        is_active = $5
      WHERE id = $6
      `,
      [
        data.name,
        data.email,
        data.phone,
        data.is_verified,
        data.is_active,
        id,
      ]
    );

    return result.rowCount;
  },

  delete: async (id) => {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );

    return result.rowCount;
  },

  getUsersList: async () => {
    const result = await pool.query(
      `SELECT * FROM users`
    );

    return result.rows;
  },
  updatePassword: async (userId, hashedPassword) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    `,
    [hashedPassword, userId]
  );

  return result.rowCount;
},
updatePassword: async (userId, hashedPassword) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    `,
    [hashedPassword, userId]
  );

  return result.rowCount;
},
findByName: async(name)=>{
  const result = await pool.query("SELECT u.* FROM users u WHERE u.name=$1",[name]);
  return result.rows[0];
}
};

export default User;