import pool from "../config/db.js";


const Taches ={
findById: async(id)=>{
  const result = await pool.query("SELECT t.* FROM taches t WHERE t.id = $1",[id]);
  return result.rows[0];
},
findBySupervisorId: async(super_id)=>{
  const result = await pool.query("SELECT t.* FROM taches t WHERE t.supervisor_id = $1",[super_id]);
  return result.rows;
},
findByInternId: async(intern_id)=>{
  const result = await pool.query("SELECT t.* FROM taches t WHERE t.intern_id = $1",[intern_id]);
  return result.rows;
},
create: async(data)=>{
const result = await pool.query("INSERT INTO taches (company_id,supervisor_id,intern_id,title,description,priority,end_date,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",[data.company_id,data.supervisor_id,data.intern_id,data.title,data.description,data.priority,data.end_date,data.status]);
return result.rows[0];
},
update: async(tache_id,data)=>{
const result = await pool.query("UPDATE taches SET company_id=$1,supervisor_id=$2,intern_id=$3,title=$4,description=$5,priority=$6,end_date=$7,status=$8 WHERE id=$9",[data.company_id,data.supervisor_id,data.intern_id,data.title,data.description,data.priority,data.end_date,data.status,tache_id
]);
return result.rowCount;
},
delete:async(tache_id)=>{
 const result = await pool.query("DELETE FROM taches WHERE id=$1",[tache_id]);
  return result.rowCount;
},
markAsDone: async(tache_id)=>{
  const result = await pool.query("UPDATE taches SET status='done' WHERE id=$1",[tache_id]);
  return result.rowCount;
},
markAsAbandoned: async(tache_id)=>{
  const result = await pool.query("UPDATE taches SET status='abandoned' WHERE id=$1",[tache_id]);
  return result.rowCount;
}

};
export default Taches;