import { body } from "express-validator";

/*
|--------------------------------------------------------------------------
| Common password validation
|--------------------------------------------------------------------------
*/

const passwordValidation = (field = "password") => [
  body(field)
    .notEmpty()
    .withMessage("Password is required")

    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")

    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")

    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];


/*
|--------------------------------------------------------------------------
| INTERN SIGN UP
|--------------------------------------------------------------------------
*/

export const validateInternSignUp = [

  // Full name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3 and 100 characters"),


  // Email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),


  // Phone
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 14 })
    .withMessage("Invalid phone number"),


  // Company
  body("company_name")
    .notEmpty()
    .withMessage("Company is required")
  .isLength({ min: 2, max: 100 })
    .withMessage("company must be between 2 and 100 characters"),


  // Internship type
  body("intern_type")
    .notEmpty()
    .withMessage("Internship type is required")
    .isIn(["intern_PFE","intern_PFC"])
    .withMessage("Internship type must be intern_PFE or intern_PFC"),


  // University / establishment
  body("establishment")
    .trim()
    .notEmpty()
    .withMessage("University establishment is required")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "University establishment must be between 2 and 100 characters"
    ),


  // Studies level
  body("studies_level")
    .trim()
    .notEmpty()
    .withMessage("Studies level is required")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Studies level must be between 2 and 100 characters"
    ),


  // Internship sector
  body("sector")
    .trim()
    .notEmpty()
    .withMessage("Internship sector is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Sector must be between 2 and 100 characters"),


  // Internship start date
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Invalid start date format"),


  // Internship end date
  body("end_date")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((value, { req }) => {

      if (!req.body.start_date) {
        return true;
      }

      const startDate = new Date(req.body.start_date);
      const endDate = new Date(value);

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }

      return true;
    }),


  // Profile picture
  body("profil_image")
    .optional()
    .isString()
    .withMessage("Profile image must be a valid URL"),


  // Thesis subject
  body("thesis_subject")
    .if((value, { req }) => req.body.inter_type === "intern_PFE")
    .trim()
    .notEmpty()
    .withMessage("Thesis subject is required for PFE internship")
    .isLength({ min: 5, max: 500 })
    .withMessage(
      "Thesis subject must be between 5 and 500 characters"
    ),


  // Password
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),


  // Confirm password
  body("confirm_password")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {

      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),
];


/*
|--------------------------------------------------------------------------
| SUPERVISOR CREATION
|--------------------------------------------------------------------------
*/

export const validateSupervisorCreation = [

  // Supervisor identifier
  body("supervisor_id")
    .trim()
    .notEmpty()
    .withMessage("Supervisor ID is required")
    .matches(/^ENC-\d+$/)
    .withMessage("Supervisor ID must follow the format ENC-001"),


  // Name
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3 and 100 characters"),


  // Professional email
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Professional email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),


  // Phone
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 14 })
    .withMessage("Invalid phone number"),


  // Position
  body("position")
    .trim()
    .notEmpty()
    .withMessage("Position is required")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Position must be between 2 and 100 characters"
    ),


  // Department
  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Department must be between 2 and 100 characters"
    ),


  // Specialization
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ min: 2, max: 150 })
    .withMessage(
      "Specialization must be between 2 and 150 characters"
    ),


  // Years of experience
  body("years_of_experience")
    .notEmpty()
    .withMessage("Years of experience is required")
    .isInt({ min: 0, max: 60 })
    .withMessage(
      "Years of experience must be a number between 0 and 60"
    )
    .toInt(),


  // Password
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];


/*
|--------------------------------------------------------------------------
| SECONDARY ADMIN SIGN UP
|--------------------------------------------------------------------------
*/

export const validateAdminSignUp = [

  /*
  | Account information
  */

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3 and 100 characters"),


  body("email")
    .trim()
    .notEmpty()
    .withMessage("Professional email is required")
    .isEmail()
    .withMessage("Please provide a valid professional email")
    .normalizeEmail(),


  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 14 })
    .withMessage("Invalid phone number"),


  body("company_name")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Company name must be between 2 and 150 characters"),


  body("profil_image")
    .optional()
    .isString()
    .withMessage("Profile image must be a valid URL"),


  body("fcm_token")
    .optional()
    .isString()
    .withMessage("FCM token must be a valid string"),


  /*
  | Admin type
  */

  body("admin_type")
    .notEmpty()
    .withMessage("Administrator type is required")
    .equals("second")
    .withMessage(
      "Only secondary administrator registration is allowed"
    ),


  /*
  | Company information
  */

  body("company_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid company ID")
    .toInt(),


  body("address")
    .trim()
    .notEmpty()
    .withMessage("Company address is required")
    .isLength({ min: 3, max: 255 })
    .withMessage(
      "Company address must be between 3 and 255 characters"
    ),


  body("logo")
    .optional()
    .isString()
    .withMessage("Company logo must be a valid URL"),


  body("website_URL")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Please provide a valid company website URL"),


  body("registration_number")
    .trim()
    .notEmpty()
    .withMessage("Company registration number is required")
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Registration number must be between 2 and 100 characters"
    ),


  body("company_email")
    .trim()
    .notEmpty()
    .withMessage("Company email is required")
    .isEmail()
    .withMessage("Please provide a valid company email")
    .normalizeEmail(),


  body("company_phone")
    .trim()
    .notEmpty()
    .withMessage("Company phone is required")
    .isLength({ min: 10, max: 14 })
    .withMessage("Invalid company phone number"),


  body("description")
    .trim()
    .notEmpty()
    .withMessage("Company description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage(
      "Company description must be between 10 and 1000 characters"
    ),


  /*
  | Password
  */

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),


  body("confirm_password")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {

      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),
];


/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const loginValidator = [

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),


  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];


/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

export const forgotPasswordValidator = [

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
];


/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

export const resetPasswordValidator = [

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),


  body("confirm_password")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {

      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),
];


/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

export const changePasswordValidator = [

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),


  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must contain at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number"),


  body("confirmPassword")
    .notEmpty()
    .withMessage("Password confirmation is required")
    .custom((value, { req }) => {

      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }

      return true;
    }),
];
export const verifyPasswordOtpValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must contain exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

