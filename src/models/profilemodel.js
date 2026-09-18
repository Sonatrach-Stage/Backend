import pool from "../config/db.js";

const Profile = {

  getProfile: async (user_id) => {

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.profil_image,
        u.profil_image_public_id,

        c.id AS company_id,
        c.name AS company_name,
        c.logo AS company_logo,

        s.id AS supervisor_id,
        s.job,
        s.department,
        s.specialization,
        s.years_of_experience,

        i.id AS intern_id,
        i.intern_type,
        i.sector,
        i.studies_level,
        i.establishment,
        i.start_date,
        i.end_date,
        i.status AS intern_status,
        i.convention_url,
        i.convention_public_id,
        i.con_status

      FROM users u

      LEFT JOIN supervisor s
        ON s.user_id = u.id

      LEFT JOIN intern i
        ON i.user_id = u.id

      LEFT JOIN company c
        ON c.id = COALESCE(i.company_id, s.company_id)
        OR c.user_id = u.id

      WHERE u.id = $1
      `,
      [user_id]
    );

    return result.rows[0];
  },
  updateProfile: async (id, data) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         phone = $2
     WHERE id = $3`,
    [data.name, data.phone, id]
  );

  return result.rowCount;
},

};

export default Profile;