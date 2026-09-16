import pool from "../config/db.js";

const Conversation = {

  // ==========================================
  // CREATE
  // ==========================================

  create: async (supervisor_id, intern_id) => {

    const result = await pool.query(
      `
      INSERT INTO conversations
      (supervisor_id, intern_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [supervisor_id, intern_id]
    );

    return result.rows[0];
  },


  // ==========================================
  // FIND BY PARTICIPANTS
  // ==========================================

  findByParticipants: async (supervisor_id, intern_id) => {

    const result = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE supervisor_id = $1
      AND intern_id = $2
      `,
      [supervisor_id, intern_id]
    );

    return result.rows[0];
  },


  // ==========================================
  // FIND BY SUPERVISOR
  // ==========================================

  findBySupervisor: async (supervisor_id) => {

    const result = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE supervisor_id = $1
      ORDER BY created_at DESC
      `,
      [supervisor_id]
    );

    return result.rows;
  },


  // ==========================================
  // FIND BY INTERN
  // ==========================================

  findByIntern: async (intern_id) => {

    const result = await pool.query(
      `
      SELECT *
      FROM conversations
      WHERE intern_id = $1
      ORDER BY created_at DESC
      `,
      [intern_id]
    );

    return result.rows;
  }

};

export default Conversation;