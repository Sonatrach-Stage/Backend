import pool from "../config/db.js";

const Statistics = {

// ==========================================
// 1. GLOBAL COUNTS
// ==========================================

getGlobalCounts: async () => {

const result = await pool.query(`
  SELECT

    (SELECT COUNT(*)
     FROM company) AS total_companies,

    (SELECT COUNT(*)
     FROM company
     WHERE company_status = 'APPROVED') AS approved_companies,

    (SELECT COUNT(*)
     FROM company
     WHERE company_status = 'pending') AS pending_companies,

    (SELECT COUNT(*)
     FROM company
     WHERE company_status = 'rejected') AS rejected_companies,

    (SELECT COUNT(*)
     FROM intern) AS total_interns,

    (SELECT COUNT(*)
     FROM supervisor) AS total_supervisors,

    (SELECT COUNT(*)
     FROM intern
     WHERE intern_type = 'intern_PFE') AS total_pfe,

    (SELECT COUNT(*)
     FROM intern
     WHERE intern_type = 'intern_PFC') AS total_pfc,

    (SELECT COUNT(*)
     FROM taches) AS total_tasks,

    (SELECT COUNT(*)
     FROM documents) AS total_documents,

    (SELECT COUNT(*)
     FROM appointments) AS total_appointments
`);

return result.rows[0];

},

// ==========================================
// 2. COMPANIES BY STATUS
// ==========================================

getCompaniesByStatus: async () => {

const result = await pool.query(`
  SELECT
    company_status AS status,
    COUNT(*) AS count
  FROM company
  GROUP BY company_status
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 3. INTERNS BY TYPE
// ==========================================

getInternsByType: async () => {

const result = await pool.query(`
  SELECT
    intern_type AS type,
    COUNT(*) AS count
  FROM intern
  GROUP BY intern_type
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 4. INTERNS BY STATUS
// ==========================================

getInternsByStatus: async () => {

const result = await pool.query(`
  SELECT
    status,
    COUNT(*) AS count
  FROM intern
  GROUP BY status
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 5. TASKS BY STATUS
// ==========================================

getTasksByStatus: async () => {

const result = await pool.query(`
  SELECT
    status,
    COUNT(*) AS count
  FROM taches
  GROUP BY status
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 6. TASKS BY PRIORITY
// ==========================================

getTasksByPriority: async () => {

const result = await pool.query(`
  SELECT
    priority,
    COUNT(*) AS count
  FROM taches
  GROUP BY priority
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 7. APPOINTMENTS BY STATUS
// ==========================================

getAppointmentsByStatus: async () => {

const result = await pool.query(`
  SELECT
    status,
    COUNT(*) AS count
  FROM appointments
  GROUP BY status
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 8. DOCUMENTS BY STATUS
// ==========================================

getDocumentsByStatus: async () => {

const result = await pool.query(`
  SELECT
    status,
    COUNT(*) AS count
  FROM documents
  GROUP BY status
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 9. DOCUMENTS BY TYPE
// ==========================================

getDocumentsByType: async () => {

const result = await pool.query(`
  SELECT
    document_type AS type,
    COUNT(*) AS count
  FROM documents
  GROUP BY document_type
  ORDER BY count DESC
`);

return result.rows;

},

// ==========================================
// 10. PLATFORM GROWTH
// ==========================================
getPlatformGrowth: async () => {

const result = await pool.query(`
SELECT
month,
SUM(companies) AS companies,
SUM(interns) AS interns,
SUM(supervisors) AS supervisors
FROM (
  SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS companies,
    0 AS interns,
    0 AS supervisors
  FROM company
  GROUP BY DATE_TRUNC('month', created_at)

  UNION ALL

  SELECT
    DATE_TRUNC('month', start_date) AS month,
    0 AS companies,
    COUNT(*) AS interns,
    0 AS supervisors
  FROM intern
  WHERE start_date IS NOT NULL
  GROUP BY DATE_TRUNC('month', start_date)

  UNION ALL

  SELECT
    DATE_TRUNC('month', created_at) AS month,
    0 AS companies,
    0 AS interns,
    COUNT(*) AS supervisors
  FROM supervisor
  GROUP BY DATE_TRUNC('month', created_at)

) AS statistics

GROUP BY month
ORDER BY month ASC

`);

return result.rows;
},
// ==========================================
// 11. PLATFORM ACTIVITY
// ==========================================

getPlatformActivity: async () => {

const result = await pool.query(`
  SELECT
    activity_date,
    SUM(tasks) AS tasks,
    SUM(documents) AS documents,
    SUM(appointments) AS appointments
  FROM (

    SELECT
      DATE(end_date) AS activity_date,
      COUNT(*) AS tasks,
      0 AS documents,
      0 AS appointments
    FROM taches
    GROUP BY DATE(end_date)

    UNION ALL

    SELECT
      DATE(created_at) AS activity_date,
      0 AS tasks,
      COUNT(*) AS documents,
      0 AS appointments
    FROM documents
    GROUP BY DATE(created_at)

    UNION ALL

    SELECT
      appointment_date AS activity_date,
      0 AS tasks,
      0 AS documents,
      COUNT(*) AS appointments
    FROM appointments
    GROUP BY appointment_date

  ) AS activity

  GROUP BY activity_date
  ORDER BY activity_date ASC
`);

return result.rows;

},
getCompanyCounts: async (companyId) => {

const result = await pool.query(`
SELECT

  (
    SELECT COUNT(*)
    FROM intern
    WHERE company_id = $1
  ) AS total_interns,

  (
    SELECT COUNT(*)
    FROM intern
    WHERE company_id = $1
    AND status = 'waiting'
  ) AS waiting_interns,

  (
    SELECT COUNT(*)
    FROM intern
    WHERE company_id = $1
    AND status = 'supervisor_assigned'
  ) AS assigned_interns,

  (
    SELECT COUNT(*)
    FROM supervisor
    WHERE company_id = $1
  ) AS total_supervisors,

  (
    SELECT COUNT(*)
    FROM intern
    WHERE company_id = $1
    AND intern_type = 'intern_PFE'
  ) AS total_pfe,

  (
    SELECT COUNT(*)
    FROM intern
    WHERE company_id = $1
    AND intern_type = 'intern_PFC'
  ) AS total_pfc,

  (
    SELECT COUNT(*)
    FROM taches
    WHERE company_id = $1
  ) AS total_tasks,

  (
    SELECT COUNT(*)
    FROM documents d
    JOIN intern i ON d.intern_id = i.id
    WHERE i.company_id = $1
  ) AS total_documents,

  (
    SELECT COUNT(*)
    FROM appointments a
    JOIN intern i ON a.intern_id = i.id
    JOIN  supervisor s ON a.supervisor_id= s.id 
    WHERE i.company_id = $1 OR s.company_id = $1
  ) AS total_appointments

`, [companyId]);

return result.rows[0];
},

getCompanyInternsByStatus: async (companyId) => {

const result = await pool.query("SELECT status,COUNT(*) AS count FROM intern WHERE company_id = $1 GROUP BY status ORDER BY count DESC", [companyId]);
return result.rows;
},

getCompanyInternsByType: async (companyId) => {

const result = await pool.query("SELECT intern_type AS type,COUNT(*) AS count FROM intern WHERE company_id = $1 GROUP BY intern_type ORDER BY count DESC", [companyId]);

return result.rows;
},

getCompanyTasksByStatus: async (companyId) => {

const result = await pool.query("SELECT status,COUNT(*) AS count FROM taches WHERE company_id = $1 GROUP BY status ORDER BY count DESC ", [companyId]);

return result.rows;
},

getCompanyTasksByPriority: async (companyId) => {

const result = await pool.query("SELECT priority,COUNT(*) AS count FROM taches WHERE company_id = $1 GROUP BY priority ORDER BY count DESC", [companyId]);

return result.rows;
},

getCompanyDocumentsByStatus: async (companyId) => {

const result = await pool.query("SELECT d.status,COUNT(*) AS count FROM documents d JOIN intern i ON d.intern_id = i.id  WHERE i.company_id = $1  GROUP BY d.status ORDER BY count DESC", [companyId])

return result.rows;
},

getCompanyAppointmentsByStatus: async (companyId) => {

const result = await pool.query("SELECT a.status, COUNT(*) AS count FROM appointments a JOIN intern i ON a.intern_id = i.id JOIN supervisor s ON s.id=a.supervisor_id WHERE i.company_id = $1 OR s.company_id=$1 GROUP BY a.status ORDER BY count DESC", [companyId]);

return result.rows;
},

getSupervisorWorkload: async (companyId) => {

const result = await pool.query(`
SELECT
s.id AS supervisor_id,
u.name AS supervisor_name,
COUNT(i.id) AS intern_count
FROM supervisor s

JOIN users u
  ON s.user_id = u.id

LEFT JOIN intern i
  ON i.supervisor_id = s.id
  AND i.company_id = $1

WHERE s.company_id = $1

GROUP BY s.id, u.name
ORDER BY intern_count DESC

`, [companyId]);

return result.rows;
},

getCompanyInternshipGrowth: async (companyId) => {

const result = await pool.query("SELECT  DATE_TRUNC('month', start_date) AS month,COUNT(*) AS interns FROM intern WHERE company_id = $1 AND start_date IS NOT NULL GROUP BY DATE_TRUNC('month', start_date) ORDER BY month ASC", [companyId]);

return result.rows;
},// ========================================
// SUPERVISOR STATISTICS
// ========================================

getSupervisorCounts: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT

      (
        SELECT COUNT(*)
        FROM intern
        WHERE supervisor_id = $1
      ) AS total_interns,

      (
        SELECT COUNT(*)
        FROM intern
        WHERE supervisor_id = $1
        AND status = 'supervisor_assigned'
      ) AS active_interns,

      (
        SELECT COUNT(*)
        FROM taches
        WHERE supervisor_id = $1
      ) AS total_tasks,

      (
        SELECT COUNT(*)
        FROM activities
        WHERE supervisor_id = $1
      ) AS total_activities,

      (
        SELECT COUNT(*)
        FROM documents d
        JOIN intern i
          ON d.intern_id = i.id
        WHERE i.supervisor_id = $1
      ) AS total_documents,

      (
        SELECT COUNT(*)
        FROM appointments
        WHERE supervisor_id = $1
      ) AS total_appointments

    `,
    [supervisorId]
  );

  return result.rows[0];
},
getSupervisorInternsByStatus: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      status,
      COUNT(*) AS count
    FROM intern
    WHERE supervisor_id = $1
    GROUP BY status
    ORDER BY count DESC
    `,
    [supervisorId]
  );

  return result.rows;
},

getSupervisorInternsByType: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      intern_type AS type,
      COUNT(*) AS count
    FROM intern
    WHERE supervisor_id = $1
    GROUP BY intern_type
    ORDER BY count DESC
    `,
    [supervisorId]
  );

  return result.rows;
},
getSupervisorTasksByStatus: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      status,
      COUNT(*) AS count
    FROM taches
    WHERE supervisor_id = $1
    GROUP BY status
    ORDER BY count DESC
    `,
    [supervisorId]
  );

  return result.rows;
},

getSupervisorTasksByPriority: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      priority,
      COUNT(*) AS count
    FROM taches
    WHERE supervisor_id = $1
    GROUP BY priority
    ORDER BY count DESC
    `,
    [supervisorId]
  );

  return result.rows;
},
getSupervisorDocumentsByStatus: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      d.status,
      COUNT(*) AS count
    FROM documents d
    JOIN intern i
      ON d.intern_id = i.id
    WHERE i.supervisor_id = $1
    GROUP BY d.status
    ORDER BY count DESC
    `,
    [supervisorId]
  );

  return result.rows;
},
getSupervisorAppointmentsByStatus: async (supervisorId) => {
   const result = await pool.query( ` SELECT status, 
    COUNT(*) AS count 
    FROM appointments 
    WHERE supervisor_id = $1 
    GROUP BY status 
    ORDER BY count DESC `, [supervisorId] ); return result.rows; },
getSupervisorActivities: async (supervisorId) => {
  const result = await pool.query(
    `
    SELECT
      DATE_TRUNC('month', end_date) AS month,
      COUNT(*) AS activities
    FROM activities
    WHERE supervisor_id = $1
    GROUP BY DATE_TRUNC('month', end_date)
    ORDER BY month ASC
    `,
    [supervisorId]
  );

  return result.rows;
},
// ========================================
// INTERN STATISTICS
// ========================================
getInternCounts: async (internId) => {
  const result = await pool.query(
    `
    SELECT

      (
        SELECT COUNT(*)
        FROM taches
        WHERE intern_id = $1
      ) AS total_tasks,

      (
        SELECT COUNT(*)
        FROM taches
        WHERE intern_id = $1
        AND status = 'done'
      ) AS completed_tasks,

      (
        SELECT COUNT(*)
        FROM documents
        WHERE intern_id = $1
      ) AS total_documents,

      (
        SELECT COUNT(*)
        FROM appointments
        WHERE intern_id = $1
      ) AS total_appointments

    `,
    [internId]
  );

  return result.rows[0];
},
getInternTasksByStatus: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      status,
      COUNT(*) AS count
    FROM taches
    WHERE intern_id = $1
    GROUP BY status
    ORDER BY count DESC
    `,
    [internId]
  );

  return result.rows;
},

getInternTasksByPriority: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      priority,
      COUNT(*) AS count
    FROM taches
    WHERE intern_id = $1
    GROUP BY priority
    ORDER BY count DESC
    `,
    [internId]
  );

  return result.rows;
},
getInternDocumentsByStatus: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      status,
      COUNT(*) AS count
    FROM documents
    WHERE intern_id = $1
    GROUP BY status
    ORDER BY count DESC
    `,
    [internId]
  );

  return result.rows;
},

getInternDocumentsByType: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      document_type AS type,
      COUNT(*) AS count
    FROM documents
    WHERE intern_id = $1
    GROUP BY document_type
    ORDER BY count DESC
    `,
    [internId]
  );

  return result.rows;
},
getInternAppointmentsByStatus: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      status,
      COUNT(*) AS count
    FROM appointments
    WHERE intern_id = $1
    GROUP BY status
    ORDER BY count DESC
    `,
    [internId]
  );

  return result.rows;
},
getInternProgress: async (internId) => {
  const result = await pool.query(
    `
    SELECT
      start_date,
      end_date,
      status,
      intern_type
    FROM intern
    WHERE id = $1
    `,
    [internId]
  );

  return result.rows[0];
},
};

export default Statistics;

