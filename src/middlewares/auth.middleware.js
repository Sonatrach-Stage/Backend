import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';
import Role from '../models/rolemodel.js';
import Admin from '../models/adminmodel.js';
import supervisor from '../models/supervisormodel.js';
import Intern from '../models/internmodel.js';


// =====================================================
// PROTECT
// Vérifie que l'utilisateur est authentifié
// =====================================================

export const protect = async (req, res, next) => {
  console.log("========== PROTECT 1 : ENTER ==========");
  try {
console.log("========== PROTECT 2 : TRY ==========");
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;
console.log("AUTH HEADER =", authHeader);
    // 2. Vérifier que le token existe
    //    et qu'il commence par "Bearer "
    if (!authHeader?.startsWith('Bearer ')) {
       console.log("❌ PROTECT ERROR : Invalid Authorization format");
      return res.status(401).json({
        message: 'Token manquant.'
      });
    }

    // 3. Récupérer uniquement le JWT
    const token = authHeader.split(' ')[1];
    console.log("TOKEN =", token);

        console.log("========== PROTECT 3 : VERIFY JWT ==========");
    // 4. Vérifier et décoder le JWT
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("JWT_SECRET length:", process.env.JWT_SECRET?.length);
console.log("AVANT VERIFY");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    console.log("APRÈS VERIFY");
 console.log("✅ DECODED TOKEN =", decoded);

        console.log("========== PROTECT 4 : FIND USER ==========");
    // 5. Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id);

    // 6. Vérifier que l'utilisateur existe
    //    et que son compte est actif
    if (!user || !user.is_active) {
      console.log(
                `❌ PROTECT ERROR : User ${decoded.id} not found`
            );
      return res.status(401).json({
        message: 'Utilisateur non autorisé.'
      });
    }

    // 7. Mettre l'utilisateur connecté dans req.user
    req.user = user;
  console.log("✅ PROTECT SUCCESS");
 
    // =================================================
    // INFORMATIONS SELON LE TYPE D'UTILISATEUR
    // =================================================
console.log("✅ lisalisa:",user.id);
    // Si l'utilisateur est un administrateur
    const adminInfo = await Admin.findByUserId(user.id);
    req.adminInfo = adminInfo || null;
  console.log("✅ adminInfo:",adminInfo);

    // Si l'utilisateur est un encadrant
    const supervisorInfo =
      await supervisor.findByUserId(user.id);

    req.supervisorInfo = supervisorInfo || null;
  console.log("✅ req.supervisorInfo",req.supervisorInfo);

    // Si l'utilisateur est un stagiaire
    const internInfo =
      await Intern.findByUserId(user.id);

    req.internInfo = internInfo || null;
console.log("✅ req.internInfo",req.internInfo);
console.log("========== BEFORE NEXT ==========");
    // 8. Passer au middleware suivant
    next();

  } catch (error) {

    console.error("🔥🔥🔥 PROTECT ERROR 🔥🔥🔥");
    console.error("ERROR NAME:", error.name);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);

    return res.status(401).json({
        success: false,
        message: "Erreur dans le middleware protect",
        error: error.message
    });
}
};


// =====================================================
// RESTRICT TO
// Vérifie le rôle de l'utilisateur
// =====================================================

export const restrictTo = (...roles) => {

  return async (req, res, next) => {

    try {

      // 1. Récupérer les rôles de l'utilisateur connecté
      const userRoles =
        await Role.getUsersRole(req.user.id);
console.log("USERROLE: ",userRoles)
      // 2. Extraire uniquement les noms des rôles
      const roleNames =
        userRoles.name;
console.log("roleNames: ",roleNames)
      // 3. Vérifier si l'utilisateur possède
      //    au moins un des rôles autorisés
      const hasRole =
        roles.some((role) =>
          roleNames.includes(role)
        );

      // 4. Aucun rôle autorisé
      if (!hasRole) {
        return res.status(403).json({
          message: 'Accès refusé.'
        });
      }
//===============FIN RESTRICTO =======================
      // 5. Rôle autorisé
      next();

    } catch (error) {

      return res.status(500).json({
        message: 'Erreur lors de la vérification du rôle.'
      });
    }
  };
};


// =====================================================
// HAS PERMISSION
// Vérifie une permission précise
// =====================================================

export const hasPermission = (permission) => {

  return async (req, res, next) => {

    try {

      // 1. Récupérer les rôles de l'utilisateur
      const userRoles =
        await Role.getUsersRole(req.user.id);

      // 2. Récupérer les IDs des rôles
      const roleIds =
        userRoles.map((role) => role.id);

      // 3. Vérifier si l'un des rôles possède
      //    la permission demandée
      const allowed =
        await Role.haspermission(
          roleIds,
          permission
        );

      // 4. Permission refusée
      if (!allowed) {
        return res.status(403).json({
          message: 'Permission refusée.'
        });
      }

      // 5. Permission accordée
      next();

    } catch (error) {

      return res.status(500).json({
        message: 'Erreur lors de la vérification de la permission.'
      });
    }
  };
};

