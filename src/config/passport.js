import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User from '../models/usermodel.js';
import Role from '../models/rolemodel.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Récupérer l'email du compte Google
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(null, false, {
            message: "Impossible de récupérer l'adresse email Google.",
          });
        }

        // Chercher l'utilisateur dans notre base de données
        const user = await User.findByEmail(email);

        // Aucun compte correspondant
        if (!user) {
          return done(null, false, {
            message:
              "Aucun compte associé à cet email. Veuillez vous inscrire d'abord.",
          });
        }

        // Vérifier que le compte est actif
        if (!user.is_active) {
          return done(null, false, {
            message: 'Votre compte est désactivé.',
          });
        }

        // Récupérer le rôle de l'utilisateur
        const roles = await Role.getUserRoles(user.id);

        user.role = roles[0]?.role_name || null;

        // Connexion réussie
        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;