import pool from "../config/db.js";

const Company = {
  // Find a company by the user who owns/manages it
  findByUserId: async (user_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE user_id = $1
      `,
      [user_id]
    );

    return result.rows[0];
  },

  // Find companies by registration number
  findByAgrement: async (reg_number) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE registration_number = $1
      `,
      [reg_number]
    );

    return result.rows;
  },

  // Find a company by name
  findByName: async (name) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE LOWER(name) = LOWER($1)
      `,
      [name]
    );

    return result.rows[0];
  },

  // Find a company by ID
  findById: async (company_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE id = $1
      `,
      [company_id]
    );

    return result.rows[0];
  },

  // Create a company
  create: async (data) => {
    const result = await pool.query(
      `
      INSERT INTO company (
        name,
        address,
        logo,
        description,
        website_URL,
        registration_number,
        company_email,
        company_phone,
        created_at,
        updated_at,
        user_id,
        company_status
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, NOW(), NOW(), $9, $10
      )
      RETURNING *
      `,
      [
        data.name,
        data.address,
        data.logo,
        data.description,
        data.website_URL,
        data.registration_number,
        data.company_email,
        data.company_phone,
        data.user_id,
        data.company_status || "pending",
      ]
    );

    return result.rows[0];
  },

  // Update a company
  update: async (company_id, data) => {
    const result = await pool.query(
      `
      UPDATE company
      SET
        name = $1,
        address = $2,
        logo = $3,
        description = $4,
        website_URL = $5,
        registration_number = $6,
        company_email = $7,
        company_phone = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
      `,
      [
        data.name,
        data.address,
        data.logo,
        data.description,
        data.website_URL,
        data.registration_number,
        data.company_email,
        data.company_phone,
        company_id,
      ]
    );

    return result.rows[0];
  },

  // Delete a company
  delete: async (company_id) => {
    const result = await pool.query(
      `
      DELETE FROM company
      WHERE id = $1
      `,
      [company_id]
    );

    return result.rowCount;
  },

  // Approve a company
  approve: async (company_id) => {
    const result = await pool.query(
      `
      UPDATE company
      SET company_status = 'APPROVED',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [company_id]
    );

    return result.rows[0];
  },

  // Reject a company
  reject: async (company_id) => {
    const result = await pool.query(
      `
      UPDATE company
      SET company_status = 'rejected',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [company_id]
    );

    return result.rows[0];
  },

  // Find pending companies
  findPending: async () => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE company_status = 'pending'
      ORDER BY created_at ASC
      `
    );

    return result.rows;
  },

  // Find a pending company by its user_id
  findPendingByUserId: async (user_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE user_id = $1
        AND company_status = 'pending'
      `,
      [user_id]
    );

    return result.rows[0];
  },

  // Find all approved companies
  // Used for the intern signup form
  findAllApproved: async () => {
    const result = await pool.query(
      `
      SELECT id, name
      FROM company
      WHERE company_status = 'APPROVED'
      ORDER BY name ASC
      `
    );

    return result.rows;
  },

  // Find an approved company by its user_id
  findApprovedByUserId: async (user_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE user_id = $1
        AND company_status = 'APPROVED'
      `,
      [user_id]
    );

    return result.rows[0];
  },

  // Find an approved company by its ID
  findApprovedByCompanyId: async (company_id) => {
    const result = await pool.query(
      `
      SELECT *
      FROM company
      WHERE id = $1
        AND company_status = 'APPROVED'
      `,
      [company_id]
    );

    return result.rows[0];
  },
  findAll: async () => {
    const result = await pool.query(`
      SELECT *
      FROM company
      ORDER BY created_at DESC
    `);

    return result.rows;
  },
};

export default Company;
