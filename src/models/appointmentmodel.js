import pool from "../config/db.js";

const Appointment = {
  // =========================
  // CREATE
  // =========================
  create: async ({
    intern_id,
    supervisor_id,
    title,
    description,
    appointment_date,
    start_time,
    end_time,
    meeting_type,
    location,
    meeting_link,
    created_by,
  }) => {
    const result = await pool.query(
      `INSERT INTO appointments (
        intern_id,
        supervisor_id,
        title,
        description,
        appointment_date,
        start_time,
        end_time,
        meeting_type,
        location,
        meeting_link,
        created_by
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11
      )
      RETURNING *`,
      [
        intern_id,
        supervisor_id,
        title,
        description,
        appointment_date,
        start_time,
        end_time,
        meeting_type,
        location,
        meeting_link,
        created_by,
      ]
    );

    return result.rows[0];
  },

  // =========================
  // FIND BY ID
  // =========================
  findById: async (id) => {
    const result = await pool.query(
      `SELECT *
       FROM appointments
       WHERE id = $1`,
      [id]
    );

    return result.rows[0];
  },

  // =========================
  // FIND INTERN APPOINTMENTS
  // =========================
  findByIntern: async (internId) => {
    const result = await pool.query(
      `SELECT *
       FROM appointments
       WHERE intern_id = $1
       ORDER BY appointment_date ASC, start_time ASC`,
      [internId]
    );

    return result.rows;
  },

  // =========================
  // FIND SUPERVISOR APPOINTMENTS
  // =========================
  findBySupervisor: async (supervisorId) => {
    const result = await pool.query(
      `SELECT *
       FROM appointments
       WHERE supervisor_id = $1
       ORDER BY appointment_date ASC, start_time ASC`,
      [supervisorId]
    );

    return result.rows;
  },

  // =========================
  // CHECK INTERN / SUPERVISOR
  // =========================
  findInternForSupervisor: async (internId, supervisorId) => {
    const result = await pool.query(
      `SELECT *
       FROM intern
       WHERE id = $1
       AND supervisor_id = $2`,
      [internId, supervisorId]
    );

    return result.rows[0];
  },

  // =========================
  // UPDATE
  // =========================
  update: async (id, data) => {
    const result = await pool.query(
      `UPDATE appointments
       SET
         title = $1,
         description = $2,
         appointment_date = $3,
         start_time = $4,
         end_time = $5,
         meeting_type = $6,
         location = $7,
         meeting_link = $8,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [
        data.title,
        data.description,
        data.appointment_date,
        data.start_time,
        data.end_time,
        data.meeting_type,
        data.location,
        data.meeting_link,
        id,
      ]
    );

    return result.rows[0];
  },

  // =========================
  // ACCEPT
  // =========================
  accept: async (id) => {
    const result = await pool.query(
      `UPDATE appointments
       SET
         status = 'ACCEPTED',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       AND status = 'PENDING'
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },

  // =========================
  // REJECT
  // =========================
  reject: async (id, reason = null) => {
    const result = await pool.query(
      `UPDATE appointments
       SET
         status = 'REJECTED',
         rejection_reason = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       AND status = 'PENDING'
       RETURNING *`,
      [reason, id]
    );

    return result.rows[0];
  },

  // =========================
  // CANCEL
  // =========================
  cancel: async (id, reason = null) => {
    const result = await pool.query(
      `UPDATE appointments
       SET
         status = 'CANCELLED',
         cancellation_reason = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       AND status NOT IN ('CANCELLED', 'COMPLETED')
       RETURNING *`,
      [reason, id]
    );

    return result.rows[0];
  },

  // =========================
  // COMPLETE
  // =========================
  complete: async (id) => {
    const result = await pool.query(
      `UPDATE appointments
       SET
         status = 'COMPLETED',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       AND status = 'ACCEPTED'
       RETURNING *`,
      [id]
    );

    return result.rows[0];
  },
};

export default Appointment;