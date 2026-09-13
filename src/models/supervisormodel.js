import pool from "../config/db.js";

const supervisor={
findByUserId : async (user_id)=>{
  const result = await pool.query('SELECT * FROM supervisor s WHERE s.user_id= $1',[user_id]);
return result.rows[0];
},
  findById: async (id)=>{
const result = await pool.query("SELECT s.* FROM supervisor s WHERE s.id=$1",[id]);
return result.rows[0];
},
findByCompanyId : async (company_id)=>{
const result = await pool.query('SELECT * FROM supervisor s WHERE s.company_id=$1',[company_id]);
return result.rows;
},
getAllSupervisors : async ()=>{
  const result = await pool.query('SELECT * FROM supervisor ');
  return result.rows;
},
getAllSupervisorsByCompany : async(company_id)=>{
const result = await pool.query('SELECT * FROM supervisor WHERE company_id =$1',[company_id]);
return result.rows;
},
create : async(data)=>{
const result = await pool.query(
  `
  INSERT INTO supervisor (
    company_id,
    job,
    department,
    specialization,
    years_of_experience,
    user_id
  )
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
  `,
  [
    data.company_id,
    data.job,
    data.department,
    data.specialization,
    data.years_of_experience,
    data.user_id
  ]
);

return result.rows[0];
},
update : async(user_id,data)=>{
  const result = await pool.query('UPDATE supervisor s SET $1 where s.user_id=$2 ',[data,user_id]);
return result.rowCount;
},
delete : async (user_id)=>{
  const result = await pool.query('DELETE FROM supervisor s WHERE s.user_id=$1',[user_id]);
return result.rowCount;
},
findByNameAndCompany: async (name,company_id)=>{
  const result = await pool.query("SELECT s.* FROM supervisor s JOIN users u ON s.user_id=u.id WHERE u.name=$1 AND s.company_id=$2"[name,company_id]);
  return result.rows[0];
}
};

export default supervisor;