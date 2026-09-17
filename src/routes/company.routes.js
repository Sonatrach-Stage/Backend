import express from "express";
import Company from "../models/companymodel.js";

const router = express.Router();

router.get("/approved", async (req, res, next) => {
  try {
    const companies = await Company.findAllApproved();

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
});

export default router;