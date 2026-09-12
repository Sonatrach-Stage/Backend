import "../env.js";
import app from "../src/app.js";
import pool from "../src/config/db.js";
const PORT = process.env.PORT||3000;

app.listen(PORT,(req,res)=>{
  console.log("the server is running on ",PORT);
});
console.log("APRÈS LISTEN");