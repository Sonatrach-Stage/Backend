import pool from "../config/db.js";

const supervisor={
findByUserId : async (user_id)=>{
  const result = await pool.query('SELECT * FROM supervisor s WHERE s.user_id= $1',[user_id]);
return result.rows[0];
},
findByCompanyId : async (company_id)=>{
const result = await pool.query('SELECT * FROM supervisor s WHERE s.company_id=$1',[company_id]);
return result.rows;
},
getAllSupervisors : async ()=>{
  const resulr = await pool.query('SELECT * FROM supervisor ');
  return result.rows;
},
getAllSupervisorsByCompany : async(company_id)=>{
const result = await pool.query('SELECT * FROM supervisor WHERE company_id =$1',[company_id]);
return result.rows;
},
create : async(data)=>{
const result = await pool.query('INSERT INTO supervisor VALUES $1 ',[data]);
return result.rowCount;
},
update : async(user_id,data)=>{
  const result = await pool.query('UPDATE supervisor s SET $1 where s.user_id=$2 ',[data,user_id]);
return result.rowCount;
},
delete : async (user_id)=>{
  const result = await pool.query('DELETE FROM supervisor s WHERE s.user_id=$1',[user_id]);
return result.rowCount;
}
};

export default supervisor;