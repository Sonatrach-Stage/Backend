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
  updateProfile: async (id, data) => {
  const result = await pool.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         phone = COALESCE($2, phone)
     WHERE id = $3
     RETURNING id, name, email, phone, profil_image, profil_image_public_id`,
    [
      data.name ?? null,
      data.phone ?? null,
      id
    ]
  );

  return result.rows[0];
},updateProfile: async (user_id, data) => {
  const result = await pool.query(
    `UPDATE supervisor
     SET job = COALESCE($1, job),
         department = COALESCE($2, department),
         specialization = COALESCE($3, specialization),
         years_of_experience = COALESCE($4, years_of_experience)
     WHERE user_id = $5
     RETURNING *`,
    [
      data.job ?? null,
      data.department ?? null,
      data.specialization ?? null,
      data.years_of_experience ?? null,
      user_id
    ]
  );

  return result.rows[0];
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
},
updateProfileImage: async (userId, { profil_image, profil_image_public_id }) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      profil_image = $1,
      profil_image_public_id = $2
    WHERE id = $3
    RETURNING id, profil_image, profil_image_public_id
    `,
    [profil_image, profil_image_public_id, userId]
  );

  return result.rows[0];
},
};

export default User;