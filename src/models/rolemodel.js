import pool from "../config/db.js";

const Role= {
findByName: async (name)=>{
  const result= await pool.query('SELECT * FROM roles r WHERE r.name=$1',[name]);
return result.rows[0];
},
assignToUser: async(user_id, role_id)=>{
const result=await pool.query('INSERT INTO user_role (user_id, role_id) VALUES ($1,$2)',[user_id,role_id]);
return result.rowCount;
},
getUsersRole: async(user_id)=>{
const result = await pool.query('SELECT r.name FROM roles r JOIN user_role ur ON ur.role_id=r.id WHERE ur.user_id=$1',[user_id]);
return result.rows[0];
},
haspermission: async (roleIds,permission)=>{
  const result = await pool.query('SELECT * FROM rolr_permission rp JOIN permission p ON p.id=rp.permission_id WHERE rp.role_id IN($1) AND p.name = $2',[roleIds,permission]);
return result.length>0
}
};
export default Role;