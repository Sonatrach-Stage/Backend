import { validationResult } from "express-validator";

export const validate= (req,res,next)=>{
  console.log("========== VALIDATION ==========");
const errors= validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({
    succes:false,
    message:"validation error",
errors:errors.array(),
  });
}
  next();
};