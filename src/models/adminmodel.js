import pool from "../config/db.js";


const Admin={
findByUserId: async(user_id)=>{
const result = await pool.query('SELECT a.* FROM admin WHERE a.user_id=$1',[user_id]);
return result.rows[0];
},
create: async({user_id,type="second",company_id=null})=>{
  const result= await pool.query('INSERT INTO admin (user_id,type,company_id)VALUES ($1,$2,$3)',[user_id,type,company_id]);
return result.rowCount;
}
};
export default Admin;