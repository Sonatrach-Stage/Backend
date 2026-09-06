export const notfound =(req,res)=>{
res.status(404).json({
  success: false,
  message:`routenot found: ${req.method} ${req.originalUrl}`,
});
};
export const errorHandler= (err,req,res,next)=>{
  console.error(err);
  const statuscode= req.statuscode || req.status || 500;
  
  res.status(statuscode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};