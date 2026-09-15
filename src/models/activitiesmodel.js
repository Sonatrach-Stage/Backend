import pool from "../config/db.js";


const Activities ={
findById: async(id)=>{
  const result = await pool.query("SELECT a.* FROM activities a WHERE a.id = $1",[id]);
  return result.rows[0];
},
findBySupervisorId: async(super_id)=>{
  const result = await pool.query("SELECT a.* FROM activities a WHERE a.supervisor_id = $1",[super_id]);
  return result.rows;
},
create: async(data)=>{
const result = await pool.query("INSERT INTO activities (company_id,supervisor_id,interns,title,description,end_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",[data.company_id,data.supervisor_id,data.interns,data.title,data.description,data.end_date]);
return result.rows[0];
},
update: async(activity_id,data)=>{
const result = await pool.query("UPDATE activities SET company_id=$1,supervisor_id=$2,interns=$3,title=$4,description=$5,end_date=$6 WHERE id=$7",[data.company_id,data.supervisor_id,data.interns,data.title,data.description,data.end_date,activity_id
]);
return result.rowCount;
},
delete:async(activity_id)=>{
 const result = await pool.query("DELETE FROM activities WHERE id=$1",[activity_id]);
  return result.rowCount;
},
getInternsActivities: async (internName) => {
  const result = await pool.query(
    "SELECT a.* FROM activities a WHERE a.interns ILIKE $1",
    [`%${internName}%`]
  );

  return result.rows;
}

};
export default Activities;