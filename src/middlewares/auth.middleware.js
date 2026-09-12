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
  try {

    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // 2. Vérifier que le token existe
    //    et qu'il commence par "Bearer "
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token manquant.'
      });
    }

    // 3. Récupérer uniquement le JWT
    const token = authHeader.split(' ')[1];

    // 4. Vérifier et décoder le JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 5. Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.id);

    // 6. Vérifier que l'utilisateur existe
    //    et que son compte est actif
    if (!user || !user.is_active) {
      return res.status(401).json({
        message: 'Utilisateur non autorisé.'
      });
    }

    // 7. Mettre l'utilisateur connecté dans req.user
    req.user = user;


    // =================================================
    // INFORMATIONS SELON LE TYPE D'UTILISATEUR
    // =================================================

    // Si l'utilisateur est un administrateur
    const adminInfo = await Admin.findByUserId(user.id);
    req.adminInfo = adminInfo || null;


    // Si l'utilisateur est un encadrant
    const supervisorInfo =
      await supervisor.findByUserId(user.id);

    req.supervisorInfo = supervisorInfo || null;


    // Si l'utilisateur est un stagiaire
    const internInfo =
      await Intern.findByUserId(user.id);

    req.internInfo = internInfo || null;


    // 8. Passer au middleware suivant
    next();

  } catch (error) {

    // Token expiré, invalide, mal signé, etc.
    return res.status(401).json({
      message: 'Token invalide.'
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

      // 2. Extraire uniquement les noms des rôles
      const roleNames =
        userRoles.map((r) => r.name);

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

