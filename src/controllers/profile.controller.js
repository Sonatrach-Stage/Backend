import Profile from "../models/profilemodel.js";
import Role from "../models/rolemodel.js";
import supervisor from "../models/supervisormodel.js";
import Intern from "../models/internmodel.js";
import User from "../models/usermodel.js";
import { uploadToCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
export const getMyProfile = async (req, res) => {

  try {

    const userId = req.user.id;

    const profile = await Profile.getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profil introuvable."
      });
    }

    const userRole = await Role.getUsersRole(userId);

    res.status(200).json({
      success: true,
      role: userRole.name,
      profile
    });

  } catch (error) {

    console.error("GET PROFILE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil.",
      error: error.message
    });

  }
};
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentRole = await Role.getUsersRole(currentUserId);

    // SUPER_ADMIN peut consulter tout le monde
    if (currentRole.name === "SUPER_ADMIN") {
      const profile = await Profile.getProfile(userId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Profil introuvable."
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });
    }

    // Company de l'utilisateur connecté
    const currentCompanyId =
      req.internInfo?.company_id ||
      req.supervisorInfo?.company_id ||
      req.adminInfo?.company_id;

    if (!currentCompanyId) {
      return res.status(403).json({
        success: false,
        message: "Impossible de déterminer votre entreprise."
      });
    }

    // Profil demandé
    const profile = await Profile.getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profil introuvable."
      });
    }

    // Vérification même entreprise
    if (profile.company_id !== currentCompanyId) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez consulter que les profils de votre entreprise."
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil."
    });
  }
};
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const role = await Role.getUsersRole(userId);

    if (!role) {
      return res.status(403).json({
        success: false,
        message: "Rôle introuvable."
      });
    }
if (req.file) {

  // Vérifier que c'est bien une image
  if (!["image/jpeg", "image/png"].includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: "La photo doit être au format JPG ou PNG."
    });
  }

  // Récupérer l'ancienne photo
  const currentUser = await User.findById(userId);

  // Upload vers Cloudinary
  const uploadedImage = await uploadToCloudinary(
    req.file.path,
    "gestion-stages/profile-images"
  );

  // Supprimer l'ancienne image si elle existe
  if (currentUser.profil_image_public_id) {
    await deleteFromCloudinary(
      currentUser.profil_image_public_id
    );
  }

  // Mettre à jour la nouvelle photo
  await User.updateProfileImage(userId, {
    profil_image: uploadedImage.secure_url,
    profil_image_public_id: uploadedImage.public_id
  });
}
    // =========================
    // INFORMATIONS COMMUNES
    // =========================

    const { name, phone } = req.body;

    await User.updateProfile(userId, {
      name,
      phone
    });

    // =========================
    // SUPERVISOR
    // =========================

    if (role.name === "SUPERVISOR") {

      const {
        job,
        department,
        specialization,
        years_of_experience
      } = req.body;

      await supervisor.updateProfile(userId, {
        job,
        department,
        specialization,
        years_of_experience
      });
    }

    // =========================
    // INTERN
    // =========================

    if (role.name === "INTERN") {

      const {
        sector,
        studies_level,
        establishment,
        start_date,
        end_date
      } = req.body;

      await Intern.updateProfile(userId, {
        sector,
        studies_level,
        establishment,
        start_date,
        end_date
      });
    }

    // =========================
    // RÉCUPÉRER LE PROFIL
    // =========================

    const profile = await Profile.getProfile(userId);

    return res.status(200).json({
      success: true,
      message: "Profil modifié avec succès.",
      profile
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du profil."
    });
  }
};