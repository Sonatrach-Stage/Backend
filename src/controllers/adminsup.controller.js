import Company from "../models/companymodel.js";
import User from "../models/usermodel.js";

export const getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findAll();

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
};


export const getPendingCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findPending();

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
};


export const getApprovedCompanies = async (req, res, next) => {
  try {
    const companies = await Company.findAllApproved();

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

export const approveCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    if (company.company_status === "APPROVED") {
      return res.status(400).json({
        message: "Company is already approved",
      });
    }

    // Approuver l'entreprise
    const updatedCompany = await Company.approve(id);

    // Activer le compte du SECONDARY_ADMIN
    if (company.user_id) {
      await User.activate(company.user_id);
    }

    res.status(200).json({
      success: true,
      message: "Company approved successfully",
      company: updatedCompany,
    });

  } catch (error) {
    next(error);
  }
};

export const rejectCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const updatedCompany = await Company.reject(id);

    res.status(200).json({
      success: true,
      message: "Company rejected successfully",
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    await Company.delete(id);

    res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};