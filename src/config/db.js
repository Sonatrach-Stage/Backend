import "../../env.js";
import pg from "pg";
const {Pool}=pg;

const pool = new Pool({
  user:process.env.DB_USER,
  database:process.env.DB_NAME,
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  password:process.env.DB_PASSWORD,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },

  max: 10
});
pool.query("SELECT NOW()")
.then(()=>console.log("Database is connected succefully"))
.catch((err)=>console.error("Database connection is failed",err));
export default pool;
