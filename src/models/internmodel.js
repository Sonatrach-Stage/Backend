import pool from "../config/db.js";

const Intern = {
  findByUserId: async (user_id) => {
    const result = await pool.query(
      `SELECT * FROM intern WHERE user_id = $1`,
      [user_id]
    );

    return result.rows[0];
  },

  findByCompanyId: async (company_id) => {
    const result = await pool.query(
      `SELECT * FROM intern WHERE company_id = $1`,
      [company_id]
    );

    return result.rows;
  },

  getInternsBySupervisor: async (supervisor_id) => {
    const result = await pool.query(
      `SELECT * FROM intern WHERE supervisor_id = $1`,
      [supervisor_id]
    );

    return result.rows;
  },

  getAllInterns: async () => {
    const result = await pool.query(
      `SELECT * FROM intern`
    );

    return result.rows;
  },

  getInternsByCompany: async (company_id) => {
    const result = await pool.query(
      `SELECT * FROM intern WHERE company_id = $1`,
      [company_id]
    );

    return result.rows;
  },

  create: async (internData) => {
  const {
    user_id,
    supervisor_id,
    company_id,
    intern_type,
    sector,
    studies_level,
    establishment,
    start_date,
    end_date,
    status,
    convention_url,
    convention_public_id,
    con_status
  } = internData;

  const result = await pool.query(
    `
    INSERT INTO intern (
      user_id,
      supervisor_id,
      company_id,
      intern_type,
      sector,
      studies_level,
      establishment,
      start_date,
      end_date,
      status,
      convention_url,
      convention_public_id,
      con_status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13
    )
    RETURNING *
    `,
    [
      user_id,
      supervisor_id,
      company_id,
      intern_type,
      sector,
      studies_level,
      establishment,
      start_date,
      end_date,
      status,
      convention_url,
      convention_public_id,
      con_status
    ]
  );

  return result.rows[0];
},

  update: async (user_id, data) => {
    const result = await pool.query(
      `
      UPDATE intern
      SET
        supervisor_id = $1,
        sector = $2,
        studies_level = $3,
        establishment = $4,
        start_date = $5,
        end_date = $6,
        status = $7,
        convention_url = $8,
        convention_public_id = $9,
        con_status = $10
      WHERE user_id = $11
      `,
      [
        data.supervisor_id,
        data.sector,
        data.studies_level,
        data.establishment,
        data.start_date,
        data.end_date,
        data.status,
        data.convention_url,
        data.convention_public_id,
        data.con_status,
        user_id,
      ]
    );

    return result.rowCount;
  },

  delete: async (user_id) => {
    const result = await pool.query(
      `DELETE FROM intern WHERE user_id = $1`,
      [user_id]
    );

    return result.rowCount;
  },
};

export default Intern;