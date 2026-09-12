import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs/promises";

import { sendEmail } from "../utils/sendEmail.js";

import EmailOtp from "../models/emailOtpModel.js";
import PendingRegistration from "../models/pendingRegistrationModel.js";
import User from "../models/usermodel.js";
import Company from "../models/companymodel.js";
import Admin from "../models/adminmodel.js";
import Intern from "../models/internmodel.js";
import Supervisor from "../models/supervisormodel.js";
import Role from "../models/rolemodel.js";

import cloudinary from "../utils/cloudinary.js";

// =====================================================
// CONSTANTS
// =====================================================

const OTP_EXPIRATION_MINUTES = 10;
const BCRYPT_SALT_ROUNDS = 10;

const CLOUDINARY_FOLDERS = {
  PROFILE_IMAGES: "gestion-stages/profile-images",
  COMPANY_LOGOS: "gestion-stages/company-logos",
  CONVENTIONS: "gestion-stages/conventions",
};

// =====================================================
// GENERATE OTP
// =====================================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =====================================================
// CREATE ERROR
// =====================================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// =====================================================
// NORMALIZE EMAIL
// =====================================================

const normalizeEmail = (email) => {
  return String(email).trim().toLowerCase();
};

// =====================================================
// DELETE TEMPORARY FILE
// =====================================================

const deleteTempFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "Erreur lors de la suppression du fichier temporaire :",
        error.message
      );
    }
  }
};

// =====================================================
// DELETE CLOUDINARY FILE
// =====================================================

const deleteCloudinaryFile = async (
  publicId,
  resourceType = "image"
) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du fichier Cloudinary :",
      error.message
    );
  }
};

// =====================================================
// UPLOAD IMAGE
// =====================================================

const uploadImage = async (file, folder) => {
  if (!file) {
    throw createError("Fichier image manquant.", 400);
  }

  if (!file.path) {
    throw createError(
      "Le fichier temporaire est introuvable.",
      400
    );
  }

  try {
    return await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });
  } finally {
    await deleteTempFile(file.path);
  }
};

// =====================================================
// UPLOAD DOCUMENT
// =====================================================

const uploadDocument = async (file, folder) => {
  if (!file) {
    throw createError("Document manquant.", 400);
  }

  if (!file.path) {
    throw createError(
      "Le fichier temporaire est introuvable.",
      400
    );
  }

  try {
    return await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
    });
  } finally {
    await deleteTempFile(file.path);
  }
};

// =====================================================
// REQUIRED FIELDS
// =====================================================

const requireFields = (body, fields) => {
  for (const field of fields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      String(body[field]).trim() === ""
    ) {
      throw createError(
        `Le champ "${field}" est obligatoire.`,
        400
      );
    }
  }
};

// =====================================================
// PASSWORD
// =====================================================

const validatePassword = (
  password,
  confirm_password
) => {
  if (password !== confirm_password) {
    throw createError(
      "Les mots de passe ne correspondent pas.",
      400
    );
  }
};

// =====================================================
// CHECK EMAIL
// =====================================================

const checkEmailAvailability = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  const existingUser =
    await User.findByEmail(normalizedEmail);

  if (existingUser) {
    throw createError(
      "Cet email est déjà utilisé.",
      409
    );
  }
};

// =====================================================
// FIND COMPANY
// =====================================================

const findCompanyByName = async (company_name) => {
  const companyName = String(company_name).trim();

  const company =
    await Company.findByName(companyName);

  if (!company) {
    throw createError(
      "Entreprise introuvable.",
      404
    );
  }

  if (!Number.isInteger(Number(company.id))) {
    throw createError(
      "L'entreprise trouvée possède un identifiant invalide.",
      500
    );
  }

  return company;
};

// =====================================================
// SEND SIGNUP OTP
// =====================================================

const sendSignupOtp = async (email, name) => {
  const normalizedEmail = normalizeEmail(email);

  const otp = generateOtp();

  await EmailOtp.deleteByEmail(normalizedEmail);

  await EmailOtp.create({
    email: normalizedEmail,
    otp_code: otp,
    expiresInMinutes: OTP_EXPIRATION_MINUTES,
  });

  await sendEmail({
    to: normalizedEmail,
    subject:
      "Vérification de votre email — Gestion des Stages",

    html: `
      <h2>Bienvenue sur Gestion des Stages</h2>

      <p>
        Bonjour <strong>${name}</strong>,
      </p>

      <p>
        Votre code de vérification est :
      </p>

      <h1 style="letter-spacing: 8px;">
        ${otp}
      </h1>

      <p>
        Ce code expire dans
        <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>.
      </p>

      <p>
        Si vous n'êtes pas à l'origine de cette demande,
        ignorez simplement cet email.
      </p>
    `,
  });
};

// =====================================================
// SIGN UP — SECONDARY ADMIN
// =====================================================

export const signUpSecondaryAdmin = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    confirm_password,
    company_name,
    company_address,
    company_phone,
    company_email,
    company_sector,
    company_description,
    company_website_URL,
    company_registration_number,
  } = req.body;

  requireFields(req.body, [
    "name",
    "email",
    "phone",
    "password",
    "confirm_password",
    "company_name",
    "company_address",
    "company_phone",
    "company_email",
    "company_sector",
    "company_description",
    "company_website_URL",
    "company_registration_number",
  ]);

  const normalizedEmail = normalizeEmail(email);

  validatePassword(
    password,
    confirm_password
  );

  const profileFile =
    req.files?.profile_image?.[0];

  const logoFile =
    req.files?.logo?.[0];

  if (!profileFile) {
    throw createError(
      "La photo de profil est obligatoire.",
      400
    );
  }

  if (!logoFile) {
    throw createError(
      "Le logo de l'entreprise est obligatoire.",
      400
    );
  }

  await checkEmailAvailability(normalizedEmail);

  let profileResult = null;
  let logoResult = null;

  try {
    profileResult = await uploadImage(
      profileFile,
      CLOUDINARY_FOLDERS.PROFILE_IMAGES
    );

    logoResult = await uploadImage(
      logoFile,
      CLOUDINARY_FOLDERS.COMPANY_LOGOS
    );

    const hashedPassword =
      await bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
      );

    await PendingRegistration.upsert({
      email: normalizedEmail,
      type: "secondary_admin",

      payload: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,

        profile_image:
          profileResult.secure_url,

        profile_image_public_id:
          profileResult.public_id,

        company_name,
        company_address,
        company_phone,
        company_email,
        company_sector,

        company_logo:
          logoResult.secure_url,

        company_logo_public_id:
          logoResult.public_id,

        company_description,
        company_website_URL,
        company_registration_number,
      },
    });

    await sendSignupOtp(
      normalizedEmail,
      name
    );

    return res.status(200).json({
      success: true,
      message:
        "Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.",
    });

  } catch (error) {

    if (profileResult?.public_id) {
      await deleteCloudinaryFile(
        profileResult.public_id
      );
    }

    if (logoResult?.public_id) {
      await deleteCloudinaryFile(
        logoResult.public_id
      );
    }

    throw error;
  }
};

// =====================================================
// SIGN UP — INTERN
// =====================================================

export const signUpIntern = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    confirm_password,
    establishment,
    studies_level,
    sector,
    company_name,
    intern_type,
    start_date,
    end_date,
  } = req.body;

  requireFields(req.body, [
    "name",
    "email",
    "phone",
    "password",
    "confirm_password",
    "establishment",
    "studies_level",
    "sector",
    "company_name",
    "intern_type",
    "start_date",
    "end_date",
  ]);

  const normalizedEmail = normalizeEmail(email);

  validatePassword(
    password,
    confirm_password
  );

  if (
    !["intern_PFE", "intern_PFC"].includes(
      intern_type
    )
  ) {
    throw createError(
      "Le type de stage doit être intern_PFE ou intern_PFC.",
      400
    );
  }

  const startDate =
    new Date(start_date);

  const endDate =
    new Date(end_date);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    throw createError(
      "Les dates de stage sont invalides.",
      400
    );
  }

  if (endDate <= startDate) {
    throw createError(
      "La date de fin doit être après la date de début.",
      400
    );
  }

  const profileFile =
    req.files?.profile_image?.[0];

  const conventionFile =
    req.files?.convention?.[0];

  if (!profileFile) {
    throw createError(
      "La photo de profil est obligatoire.",
      400
    );
  }

  if (!conventionFile) {
    throw createError(
      "La convention de stage est obligatoire.",
      400
    );
  }

  await checkEmailAvailability(
    normalizedEmail
  );

  const company =
    await findCompanyByName(company_name);

  if (company.company_status !== "APPROVED") {
    throw createError(
      "Cette entreprise n'est pas encore approuvée et ne peut pas recevoir de stagiaires.",
      400
    );
  }

  const companyId = Number(company.id);

  if (!Number.isInteger(companyId)) {
    throw createError(
      "L'identifiant de l'entreprise est invalide.",
      500
    );
  }

  let profileResult = null;
  let conventionResult = null;

  try {

    profileResult = await uploadImage(
      profileFile,
      CLOUDINARY_FOLDERS.PROFILE_IMAGES
    );

    conventionResult =
      await uploadDocument(
        conventionFile,
        CLOUDINARY_FOLDERS.CONVENTIONS
      );

    const hashedPassword =
      await bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
      );

    await PendingRegistration.upsert({
      email: normalizedEmail,
      type: "intern",

      payload: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,

        profile_image:
          profileResult.secure_url,

        profile_image_public_id:
          profileResult.public_id,

        company_id: companyId,
        company_name,

        establishment,
        studies_level,
        sector,
        intern_type,

        start_date,
        end_date,

        convention_url:
          conventionResult.secure_url,

        convention_public_id:
          conventionResult.public_id,
      },
    });

    await sendSignupOtp(
      normalizedEmail,
      name
    );

    return res.status(200).json({
      success: true,
      message:
        "Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.",
    });

  } catch (error) {

    if (profileResult?.public_id) {
      await deleteCloudinaryFile(
        profileResult.public_id
      );
    }

    if (conventionResult?.public_id) {
      await deleteCloudinaryFile(
        conventionResult.public_id,
        "raw"
      );
    }

    throw error;
  }
};

// =====================================================
// SIGN UP — SUPERVISOR
// =====================================================

export const signUpSupervisor = async (
  req,
  res
) => {

  const {
    name,
    email,
    phone,
    password,
    confirm_password,
    company_name,
    job,
    department,
    specialization,
    years_of_experience,
  } = req.body;

  requireFields(req.body, [
    "name",
    "email",
    "phone",
    "password",
    "confirm_password",
    "company_name",
    "job",
    "department",
    "specialization",
  ]);

  const normalizedEmail =
    normalizeEmail(email);

  validatePassword(
    password,
    confirm_password
  );

  let experience = null;

  if (
    years_of_experience !== undefined &&
    years_of_experience !== null &&
    years_of_experience !== ""
  ) {

    experience =
      Number(years_of_experience);

    if (
      !Number.isInteger(experience) ||
      experience < 0
    ) {
      throw createError(
        "Les années d'expérience doivent être un entier positif ou égal à zéro.",
        400
      );
    }
  }

  const profileFile =
    req.files?.profile_image?.[0];

  if (!profileFile) {
    throw createError(
      "La photo de profil est obligatoire.",
      400
    );
  }

  await checkEmailAvailability(
    normalizedEmail
  );

  const company =
    await findCompanyByName(company_name);

  if (company.company_status !== "APPROVED") {
    throw createError(
      "Cette entreprise n'est pas encore approuvée.",
      400
    );
  }

  const companyId = Number(company.id);

  if (!Number.isInteger(companyId)) {
    throw createError(
      "L'identifiant de l'entreprise est invalide.",
      500
    );
  }

  let profileResult = null;

  try {

    profileResult = await uploadImage(
      profileFile,
      CLOUDINARY_FOLDERS.PROFILE_IMAGES
    );

    const hashedPassword =
      await bcrypt.hash(
        password,
        BCRYPT_SALT_ROUNDS
      );

    await PendingRegistration.upsert({
      email: normalizedEmail,
      type: "supervisor",

      payload: {
        name,
        email: normalizedEmail,
        phone,
        password: hashedPassword,

        profile_image:
          profileResult.secure_url,

        profile_image_public_id:
          profileResult.public_id,

        company_id: companyId,
        company_name,

        job,
        department,
        specialization,

        years_of_experience:
          experience,
      },
    });

    await sendSignupOtp(
      normalizedEmail,
      name
    );

    return res.status(200).json({
      success: true,
      message:
        "Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.",
    });

  } catch (error) {

    if (profileResult?.public_id) {
      await deleteCloudinaryFile(
        profileResult.public_id
      );
    }

    throw error;
  }
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

export const verifyEmailOtp = async (
  req,
  res
) => {

  const {
    email,
    otp_code,
  } = req.body;

  // ---------------------------------------------------
  // 1. Validate input
  // ---------------------------------------------------

  if (!email || !otp_code) {
    throw createError(
      "Email et code OTP requis.",
      400
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  // ---------------------------------------------------
  // 2. Find OTP
  // ---------------------------------------------------
console.log("rachide:",normalizedEmail)
  const otpRecord =
    await EmailOtp.findValid({
      email: normalizedEmail,
      otp_code: String(otp_code).trim(),
    });
console.log("rachide:",otpRecord)
  if (!otpRecord) {
    throw createError(
      "Code OTP invalide ou expiré.",
      400
    );
  }

  // ---------------------------------------------------
  // 3. VERY IMPORTANT
  // OTP must not already be used
  // ---------------------------------------------------

  if (otpRecord.used === true) {
    throw createError(
      "Cet OTP a déjà été utilisé.",
      400
    );
  }

  // ---------------------------------------------------
  // 4. Find pending registration
  // ---------------------------------------------------

  const pending =
    await PendingRegistration.findValid(
      normalizedEmail
    );

  if (!pending) {
    throw createError(
      "Aucune inscription en attente ou délai expiré. Veuillez recommencer.",
      400
    );
  }

  // ---------------------------------------------------
  // 5. Parse payload
  // ---------------------------------------------------

  let data;

  try {

    data =
      typeof pending.payload === "string"
        ? JSON.parse(pending.payload)
        : pending.payload;

  } catch (error) {

    throw createError(
      "Les données de l'inscription sont invalides.",
      500
    );
  }

  if (!data || typeof data !== "object") {
    throw createError(
      "Les données de l'inscription sont invalides.",
      500
    );
  }

  // ===================================================
  // SECONDARY ADMIN
  // ===================================================
console.log("MARIE: ",pending.type)
  if (pending.type === "secondary_admin") {

    let userId;
    let companyId;

    try {

      // ------------------------------------------------
      // 6. Create USER
      // ------------------------------------------------

      const user =
        await User.create({

          name: data.name,
          email: normalizedEmail,
          phone: data.phone,
          password: data.password,

          profil_image:
            data.profile_image,

          profil_image_public_id:
            data.profile_image_public_id,

          is_active: false,
        });

      userId = Number(user?.id);

      if (!Number.isInteger(userId)) {
        throw createError(
          "L'utilisateur créé possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 7. Create COMPANY
      // ------------------------------------------------

      const company =
        await Company.create({

          name: data.company_name,
          address: data.company_address,

          logo:
            data.company_logo,

          description:
            data.company_description,

          website_URL:
            data.company_website_URL,

          registration_number:
            data.company_registration_number,

          company_email:
            data.company_email,

          company_phone:
            data.company_phone,

          user_id: userId,

          company_status: "pending",
        });

      companyId = Number(company?.id);

      if (!Number.isInteger(companyId)) {
        throw createError(
          "L'entreprise créée possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 8. Create ADMIN
      // ------------------------------------------------

      await Admin.create({
        user_id: userId,
        company_id: companyId,
        ad_type: "second",
      });

      // ------------------------------------------------
      // 9. Assign ROLE
      // ------------------------------------------------

      const role =
        await Role.findByName(
          "SECONDARY_ADMIN"
        );

      if (!role) {
        throw createError(
          "Le rôle SECONDARY_ADMIN n'existe pas.",
          500
        );
      }

      await Role.assignToUser(
        userId,
        role.id
      );

      // ------------------------------------------------
      // 10. Mark OTP used
      // ------------------------------------------------

      await EmailOtp.markUsed(
        otpRecord.id
      );

      // ------------------------------------------------
      // 11. Delete pending registration
      // ------------------------------------------------

      await PendingRegistration.delete(
        normalizedEmail
      );

      // ------------------------------------------------
      // 12. Response
      // ------------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "Email vérifié. Votre demande d'inscription a été envoyée au Super Admin.",

        user: {
          id: userId,
          name: data.name,
          email: normalizedEmail,
        },

        company: {
          id: companyId,
          name: data.company_name,
          status: "PENDING",
        },
      });

    } catch (error) {
      throw error;
    }
  }

  // ===================================================
  // INTERN
  // ===================================================

  if (pending.type === "intern") {

    let userId;
    let internId;

    try {

      // ------------------------------------------------
      // 6. Create USER
      // ------------------------------------------------

      const user =
        await User.create({

          name: data.name,
          email: normalizedEmail,
          phone: data.phone,
          password: data.password,

          profil_image:
            data.profile_image,

          profil_image_public_id:
            data.profile_image_public_id,

          is_active: false,
        });

      userId = Number(user?.id);

      if (!Number.isInteger(userId)) {
        throw createError(
          "L'utilisateur créé possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 7. Company ID
      // ------------------------------------------------

      const companyId =
        Number(data.company_id);

      if (!Number.isInteger(companyId)) {
        throw createError(
          "L'identifiant de l'entreprise est invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 8. Verify company
      // ------------------------------------------------

      const company =
        await Company.findById(
          companyId
        );

      if (!company) {
        throw createError(
          "Entreprise introuvable.",
          404
        );
      }

      if (
        company.company_status !==
        "APPROVED"
      ) {
        throw createError(
          "Cette entreprise n'est pas encore approuvée.",
          400
        );
      }

      // ------------------------------------------------
      // 9. Create INTERN
      // ------------------------------------------------

      const intern =
        await Intern.create({

          user_id: userId,

          supervisor_id: null,

          company_id: companyId,

          // IMPORTANT:
          // PostgreSQL utilise inter_type
          // selon ta table actuelle
          intern_type:
            data.intern_type,

          sector:
            data.sector,

          studies_level:
            data.studies_level,

          establishment:
            data.establishment,

          start_date:
            data.start_date,

          end_date:
            data.end_date,

          status:
            "waiting",

          convention_url:
            data.convention_url,

          convention_public_id:
            data.convention_public_id,

          con_status:
            "pending",
        });

      internId =
        Number(intern?.id);

      if (!Number.isInteger(internId)) {
        throw createError(
          "Le stagiaire créé possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 10. Assign INTERN role
      // ------------------------------------------------

      const role =
        await Role.findByName(
          "INTERN"
        );

      if (!role) {
        throw createError(
          "Le rôle INTERN n'existe pas.",
          500
        );
      }

      await Role.assignToUser(
        userId,
        role.id
      );

      // ------------------------------------------------
      // 11. Mark OTP used
      // ------------------------------------------------

      await EmailOtp.markUsed(
        otpRecord.id
      );

      // ------------------------------------------------
      // 12. Delete pending
      // ------------------------------------------------

      await PendingRegistration.delete(
        normalizedEmail
      );

      // ------------------------------------------------
      // 13. Response
      // ------------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "Email vérifié. Votre demande d'inscription est maintenant en attente de validation par l'administrateur de l'entreprise.",

        user: {
          id: userId,
          name: data.name,
          email: normalizedEmail,
        },

        intern: {
          id: internId,
          company_id: companyId,
          status: "waiting",
        },
      });

    } catch (error) {
      throw error;
    }
  }

  // ===================================================
  // SUPERVISOR
  // ===================================================

  if (pending.type === "supervisor") {

    let userId;
    let supervisorId;

    try {

      // ------------------------------------------------
      // 6. Create USER
      // ------------------------------------------------

      const user =
        await User.create({

          name: data.name,
          email: normalizedEmail,
          phone: data.phone,
          password: data.password,

          profil_image:
            data.profile_image,

          profil_image_public_id:
            data.profile_image_public_id,

          is_active: false,
        });

      userId = Number(user?.id);

      if (!Number.isInteger(userId)) {
        throw createError(
          "L'utilisateur créé possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 7. Company ID
      // ------------------------------------------------

      const companyId =
        Number(data.company_id);

      if (!Number.isInteger(companyId)) {
        throw createError(
          "L'identifiant de l'entreprise est invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 8. Verify company
      // ------------------------------------------------

      const company =
        await Company.findById(
          companyId
        );

      if (!company) {
        throw createError(
          "Entreprise introuvable.",
          404
        );
      }

      if (
        company.company_status !==
        "APPROVED"
      ) {
        throw createError(
          "Cette entreprise n'est pas encore approuvée.",
          400
        );
      }

      // ------------------------------------------------
      // 9. Create SUPERVISOR
      // ------------------------------------------------

      const supervisor =
        await Supervisor.create({

          company_id:
            companyId,

          job:
            data.job,

          department:
            data.department,

          specialization:
            data.specialization,

          years_of_experience:
            data.years_of_experience,

          user_id:
            userId,
        });

      supervisorId =
        Number(supervisor?.id);

      if (
        !Number.isInteger(
          supervisorId
        )
      ) {
        throw createError(
          "Le superviseur créé possède un identifiant invalide.",
          500
        );
      }

      // ------------------------------------------------
      // 10. Assign SUPERVISOR role
      // ------------------------------------------------

      const role =
        await Role.findByName(
          "SUPERVISOR"
        );

      if (!role) {
        throw createError(
          "Le rôle SUPERVISOR n'existe pas.",
          500
        );
      }

      await Role.assignToUser(
        userId,
        role.id
      );

      // ------------------------------------------------
      // 11. Mark OTP used
      // ------------------------------------------------

      await EmailOtp.markUsed(
        otpRecord.id
      );

      // ------------------------------------------------
      // 12. Delete pending
      // ------------------------------------------------

      await PendingRegistration.delete(
        normalizedEmail
      );

      // ------------------------------------------------
      // 13. Response
      // ------------------------------------------------

      return res.status(201).json({

        success: true,

        message:
          "Email vérifié. Votre demande d'inscription de superviseur est maintenant en attente de validation.",

        user: {
          id: userId,
          name: data.name,
          email: normalizedEmail,
        },

        supervisor: {
          id: supervisorId,
          company_id: companyId,
          job: data.job,
          department:
            data.department,
          specialization:
            data.specialization,
          years_of_experience:
            data.years_of_experience,
        },
      });

    } catch (error) {
      throw error;
    }
  }

  // ===================================================
  // UNKNOWN TYPE
  // ===================================================

  throw createError(
    "Type d'inscription inconnu.",
    400
  );
};

// =====================================================
// RESEND OTP
// =====================================================

export const resendEmailOtp = async (
  req,
  res
) => {

  const { email } = req.body;

  if (!email) {
    throw createError(
      "Email requis.",
      400
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  const pending =
    await PendingRegistration.findValid(
      normalizedEmail
    );

  if (!pending) {
    throw createError(
      "Aucune inscription en attente pour cet email.",
      400
    );
  }

  let data;

  try {

    data =
      typeof pending.payload === "string"
        ? JSON.parse(pending.payload)
        : pending.payload;

  } catch (error) {

    throw createError(
      "Les données de l'inscription sont invalides.",
      500
    );
  }

  if (!data || typeof data !== "object") {
    throw createError(
      "Les données de l'inscription sont invalides.",
      500
    );
  }

  await EmailOtp.deleteByEmail(
    normalizedEmail
  );

  const otp = generateOtp();

  await EmailOtp.create({
    email: normalizedEmail,
    otp_code: otp,
    expiresInMinutes:
      OTP_EXPIRATION_MINUTES,
  });

  await sendEmail({

    to: normalizedEmail,

    subject:
      "Nouveau code de vérification — Gestion des Stages",

    html: `
      <h2>Vérification de votre email</h2>

      <p>
        Bonjour <strong>${data.name}</strong>,
      </p>

      <p>
        Votre nouveau code OTP est :
      </p>

      <h1 style="letter-spacing: 8px;">
        ${otp}
      </h1>

      <p>
        Ce code expire dans
        <strong>${OTP_EXPIRATION_MINUTES} minutes</strong>.
      </p>
    `,
  });

  return res.status(200).json({
    success: true,
    message:
      "Nouveau code OTP envoyé.",
  });
};