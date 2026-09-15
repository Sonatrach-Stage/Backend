import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// ─────────────────────────────────────────────
// Shared base config
// ─────────────────────────────────────────────
const servers = [
  { url: 'https://stagelink-lq6s.onrender.com', description: 'Production' },
  { url: 'http://localhost:3000', description: 'Local' },
];

const securitySchemes = {
  bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
};

// ─────────────────────────────────────────────
// STAGELINK SWAGGER  (/api-docs)
// Routes: Auth · Admin Secondaire
// ─────────────────────────────────────────────
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StageLink — API',
      version: '1.0.0',
      description:
        'API StageLink | Auth (inscription, connexion, OTP, mot de passe) · Admin Secondaire (gestion des stagiaires & encadrants)',
    },
    servers,
    components: {
      securitySchemes,
      schemas: {
        // ── Auth: Sign up ────────────────────────────
        SecondaryAdminSignUp: {
          type: 'object',
          required: [
            'name', 'email', 'phone', 'password', 'confirm_password',
            'company_name', 'company_address', 'company_phone', 'company_email',
            'company_sector', 'company_description', 'company_website_URL',
            'company_registration_number', 'profile_image', 'logo'
          ],
          properties: {
            name: { type: 'string', example: 'Yasmine Kaci' },
            email: { type: 'string', example: 'yasmine.kaci@example.com' },
            phone: { type: 'string', example: '0550000010' },
            password: { type: 'string', example: 'Test1234' },
            confirm_password: { type: 'string', example: 'Test1234' },
            company_name: { type: 'string', example: 'TechCorp' },
            company_address: { type: 'string', example: '12 Rue des Frères, Alger' },
            company_phone: { type: 'string', example: '0213000000' },
            company_email: { type: 'string', example: 'contact@techcorp.dz' },
            company_sector: { type: 'string', example: 'Informatique' },
            company_description: { type: 'string', example: 'Entreprise spécialisée dans le développement logiciel.' },
            company_website_URL: { type: 'string', example: 'https://techcorp.dz' },
            company_registration_number: { type: 'string', example: 'RC-2023-00123' },
            profile_image: { type: 'string', format: 'binary', description: 'Photo de profil (obligatoire)' },
            logo: { type: 'string', format: 'binary', description: "Logo de l'entreprise (obligatoire)" }
          }
        },
        InternSignUp: {
          type: 'object',
          required: [
            'name', 'email', 'phone', 'password', 'confirm_password',
            'establishment', 'studies_level', 'sector', 'company_name',
            'intern_type', 'start_date', 'end_date', 'profile_image', 'convention'
          ],
          properties: {
            name: { type: 'string', example: 'Katia Benali' },
            email: { type: 'string', example: 'katia.benali@example.com' },
            phone: { type: 'string', example: '0550000011' },
            password: { type: 'string', example: 'Test1234' },
            confirm_password: { type: 'string', example: 'Test1234' },
            establishment: { type: 'string', example: 'ESI Alger' },
            studies_level: { type: 'string', example: 'Master 2' },
            sector: { type: 'string', example: 'Développement Web' },
            company_name: { type: 'string', example: 'TechCorp', description: 'Doit correspondre à une entreprise APPROVED' },
            intern_type: { type: 'string', enum: ['intern_PFE', 'intern_PFC'], example: 'intern_PFE' },
            start_date: { type: 'string', format: 'date', example: '2026-06-01' },
            end_date: { type: 'string', format: 'date', example: '2026-09-01' },
            thesis_subject: { type: 'string', example: 'Plateforme de gestion des stages', description: 'Requis uniquement si intern_type = intern_PFE' },
            profile_image: { type: 'string', format: 'binary', description: 'Photo de profil (obligatoire)' },
            convention: { type: 'string', format: 'binary', description: 'Convention de stage (obligatoire)' }
          }
        },
        SupervisorSignUp: {
          type: 'object',
          required: [
            'name', 'email', 'phone', 'password', 'confirm_password',
            'company_name', 'job', 'department', 'specialization', 'profile_image'
          ],
          properties: {
            name: { type: 'string', example: 'Amine Boudiaf' },
            email: { type: 'string', example: 'amine.boudiaf@example.com' },
            phone: { type: 'string', example: '0550000012' },
            password: { type: 'string', example: 'Test1234' },
            confirm_password: { type: 'string', example: 'Test1234' },
            company_name: { type: 'string', example: 'TechCorp', description: 'Doit correspondre à une entreprise APPROVED' },
            job: { type: 'string', example: 'Lead Developer' },
            department: { type: 'string', example: 'R&D' },
            specialization: { type: 'string', example: 'Backend Node.js' },
            years_of_experience: { type: 'integer', example: 5, description: 'Optionnel, entier >= 0' },
            profile_image: { type: 'string', format: 'binary', description: 'Photo de profil (obligatoire)' }
          }
        },
        VerifyEmailOtp: {
          type: 'object',
          required: ['email', 'otp_code'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' },
            otp_code: { type: 'string', example: '482913' }
          }
        },
        ResendOtp: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' }
          }
        },
        CheckEmail: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' }
          }
        },
        Login: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' },
            password: { type: 'string', example: 'Test1234' }
          }
        },
        ForgotPassword: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' }
          }
        },
        VerifyPasswordOtp: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' },
            otp: { type: 'string', example: '482913', description: 'Code OTP à 6 chiffres exactement' }
          }
        },
        ResetPassword: {
          type: 'object',
          required: ['email', 'password', 'confirm_password'],
          properties: {
            email: { type: 'string', example: 'katia.benali@example.com' },
            password: { type: 'string', example: 'NewPass1234' },
            confirm_password: { type: 'string', example: 'NewPass1234' }
          }
        },
        ChangePassword: {
          type: 'object',
          required: ['current_password', 'new_password', 'confirm_password'],
          properties: {
            current_password: { type: 'string', example: 'Test1234' },
            new_password: { type: 'string', example: 'NewPass1234' },
            confirm_password: { type: 'string', example: 'NewPass1234' }
          }
        },
        AssignSupervisor: {
          type: 'object',
          required: ['supervisorName'],
          properties: {
            supervisorName: { type: 'string', example: 'Amine Boudiaf' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Admin Sec' },
    ],
    paths: {

      // ══════════════════════════════════════════════
      // AUTH — INSCRIPTION
      // ══════════════════════════════════════════════
      '/auth/secondary-admin': {
        post: {
          tags: ['Auth'],
          summary: "Inscription admin secondaire (+ création d'entreprise)",
          description: "Crée une inscription en attente et envoie un OTP par email. Le compte n'est réellement créé qu'après vérification de l'OTP via /auth/verify-email-otp.",
          security: [],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/SecondaryAdminSignUp' }
              }
            }
          },
          responses: {
            200: {
              description: 'OTP envoyé avec succès',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.'
                  }
                }
              }
            },
            400: { description: 'Champ manquant, mots de passe différents ou fichier manquant' },
            409: { description: 'Email déjà utilisé' }
          }
        }
      },
      '/auth/intern': {
        post: {
          tags: ['Auth'],
          summary: 'Inscription stagiaire',
          description: "Crée une inscription en attente et envoie un OTP par email. L'entreprise indiquée doit exister et être APPROVED. Route publique — aucun token requis.",
          security: [],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/InternSignUp' }
              }
            }
          },
          responses: {
            200: {
              description: 'OTP envoyé avec succès',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.'
                  }
                }
              }
            },
            400: { description: 'Champ manquant, dates invalides, type de stage invalide, entreprise non approuvée ou fichier manquant' },
            404: { description: 'Entreprise introuvable' },
            409: { description: 'Email déjà utilisé' }
          }
        }
      },
      '/auth/supervisor': {
        post: {
          tags: ['Auth'],
          summary: 'Inscription encadrant',
          description: "Crée une inscription en attente et envoie un OTP par email. L'entreprise indiquée doit exister et être APPROVED. Route publique — aucun token requis.",
          security: [],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/SupervisorSignUp' }
              }
            }
          },
          responses: {
            200: {
              description: 'OTP envoyé avec succès',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Un code OTP a été envoyé à votre email. Veuillez le vérifier pour continuer.'
                  }
                }
              }
            },
            400: { description: "Champ manquant, mots de passe différents, expérience invalide, entreprise non approuvée ou photo manquante" },
            404: { description: 'Entreprise introuvable' },
            409: { description: 'Email déjà utilisé' }
          }
        }
      },
      '/auth/verify-email-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Vérifier le code OTP et finaliser une inscription',
          description: 'Vérifie le code, crée réellement le compte (user + admin/intern/supervisor selon le type en attente) et assigne le rôle.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyEmailOtp' }
              }
            }
          },
          responses: {
            201: {
              description: 'Compte créé avec succès (exemple pour un stagiaire)',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: "Email vérifié. Votre demande d'inscription est maintenant en attente de validation par l'administrateur de l'entreprise.",
                    user: { id: 12, name: 'Katia Benali', email: 'katia.benali@example.com' },
                    intern: { id: 5, company_id: 2, status: 'waiting' }
                  }
                }
              }
            },
            400: { description: 'OTP invalide, expiré, déjà utilisé ou inscription en attente introuvable' }
          }
        }
      },
      '/auth/resend-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Renvoyer un nouveau code OTP',
          description: "Renvoie un nouveau code OTP pour une inscription en attente (non encore vérifiée).",
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResendOtp' }
              }
            }
          },
          responses: {
            200: {
              description: 'Nouveau OTP envoyé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Nouveau code OTP envoyé.' }
                }
              }
            },
            400: { description: 'Email manquant ou aucune inscription en attente pour cet email' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // AUTH — CONNEXION / SESSION
      // ══════════════════════════════════════════════
      '/auth/check-email': {
        post: {
          tags: ['Auth'],
          summary: 'Vérifier si un email existe déjà',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckEmail' }
              }
            }
          },
          responses: {
            200: {
              description: 'Résultat de la vérification',
              content: {
                'application/json': {
                  example: { success: true, exists: false }
                }
              }
            }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Connexion',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Login' }
              }
            }
          },
          responses: {
            200: {
              description: 'Connexion réussie',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Connexion réussie.',
                    user: { id: 12, name: 'Katia Benali', email: 'katia.benali@example.com', phone: '0550000011', role: 'INTERN' },
                    accessToken: 'eyJ...',
                    refreshToken: 'eyJ...'
                  }
                }
              }
            },
            401: { description: 'Email ou mot de passe incorrect' },
            403: { description: "Compte pas encore actif ou aucun rôle associé" }
          }
        }
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Rafraîchir l\'access token',
          description: "Le refresh token doit être envoyé dans le header Authorization au format 'Bearer <refreshToken>' (pas dans le body).",
          security: [],
          parameters: [
            {
              name: 'Authorization',
              in: 'header',
              required: true,
              schema: { type: 'string', example: 'Bearer eyJ...' },
              description: 'Refresh token au format Bearer'
            }
          ],
          responses: {
            200: {
              description: 'Nouveaux tokens générés',
              content: {
                'application/json': {
                  example: { success: true, message: 'Token renouvelé avec succès.', accessToken: 'eyJ...', refreshToken: 'eyJ...' }
                }
              }
            },
            401: { description: 'Header manquant, format invalide, refresh token invalide ou expiré' },
            403: { description: 'Compte non actif' },
            404: { description: 'Utilisateur introuvable' }
          }
        }
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Déconnexion',
          description: "Le refresh token à invalider doit être envoyé dans le header Authorization au format 'Bearer <refreshToken>'.",
          parameters: [
            {
              name: 'Authorization',
              in: 'header',
              required: true,
              schema: { type: 'string', example: 'Bearer eyJ...' },
              description: 'Refresh token au format Bearer'
            }
          ],
          responses: {
            200: {
              description: 'Déconnexion réussie',
              content: {
                'application/json': {
                  example: { success: true, message: 'Déconnexion réussie.' }
                }
              }
            },
            401: { description: 'Header manquant ou format invalide' },
            404: { description: 'Refresh token introuvable ou déjà supprimé' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // AUTH — GOOGLE OAUTH
      // ══════════════════════════════════════════════
      '/auth/google': {
        get: {
          tags: ['Auth'],
          summary: 'Connexion via Google OAuth',
          security: [],
          responses: { 302: { description: 'Redirection vers Google' } }
        }
      },
      '/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Callback Google OAuth',
          security: [],
          responses: {
            200: {
              description: 'Connexion Google réussie',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Connexion Google réussie.',
                    user: { id: 1, name: 'Katia', email: 'katia@gmail.com', phone: '0550000001', role: 'INTERN' },
                    accessToken: 'eyJ...',
                    refreshToken: 'eyJ...'
                  }
                }
              }
            },
            401: { description: 'Utilisateur Google introuvable' },
            403: { description: "Aucun rôle n'est associé à ce compte" }
          }
        }
      },
      '/auth/google/failed': {
        get: {
          tags: ['Auth'],
          summary: 'Échec authentification Google',
          security: [],
          responses: {
            401: {
              description: 'Aucun compte associé',
              content: {
                'application/json': {
                  example: { success: false, message: "Aucun compte associé à cet email. Veuillez vous inscrire d'abord." }
                }
              }
            }
          }
        }
      },

      // ══════════════════════════════════════════════
      // AUTH — MOT DE PASSE
      // ══════════════════════════════════════════════
      '/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Mot de passe oublié',
          description: 'Envoie un OTP de réinitialisation par email (valable 10 minutes). Ne révèle pas si l\'email existe ou non.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ForgotPassword' }
              }
            }
          },
          responses: {
            200: {
              description: 'Message générique de confirmation',
              content: {
                'application/json': {
                  example: { success: true, message: "Si cet email existe, un code de vérification sera envoyé." }
                }
              }
            }
          }
        }
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Vérifier le code OTP de réinitialisation',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyPasswordOtp' }
              }
            }
          },
          responses: {
            200: {
              description: 'Code vérifié',
              content: {
                'application/json': {
                  example: { success: true, message: 'Code vérifié avec succès.' }
                }
              }
            },
            400: { description: 'Code invalide, expiré ou déjà vérifié' }
          }
        }
      },
      '/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Réinitialiser le mot de passe',
          description: "Nécessite qu'un OTP ait déjà été vérifié via /auth/verify-otp.",
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResetPassword' }
              }
            }
          },
          responses: {
            200: {
              description: 'Mot de passe réinitialisé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Mot de passe réinitialisé avec succès.' }
                }
              }
            },
            400: { description: "Mots de passe différents ou code OTP non vérifié" },
            404: { description: 'Utilisateur introuvable' }
          }
        }
      },
      '/auth/change-password': {
        patch: {
          tags: ['Auth'],
          summary: 'Changer le mot de passe (connecté)',
          description: 'Protégé par le middleware protect — nécessite un access token valide (header Authorization: Bearer <accessToken>).',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChangePassword' }
              }
            }
          },
          responses: {
            200: {
              description: 'Mot de passe changé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Mot de passe modifié avec succès.' }
                }
              }
            },
            400: { description: 'Nouveaux mots de passe différents ou identique à l\'ancien' },
            401: { description: "Header manquant ou ancien mot de passe incorrect" }
          }
        }
      },

      // ══════════════════════════════════════════════
      // ADMIN SEC — STAGIAIRES
      // Toutes les routes nécessitent : protect + restrictTo("SECONDARY_ADMIN")
      // ══════════════════════════════════════════════
      '/adminsec/interns/pending': {
        get: {
          tags: ['Admin Sec'],
          summary: 'Liste des stagiaires en attente de validation',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Nécessite un access token valide appartenant à un admin secondaire. Limité à son entreprise.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des stagiaires en attente',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    interns: [
                      {
                        id: 5, user_id: 12, company_id: 2,
                        intern_type: 'intern_PFE', sector: 'Développement Web',
                        studies_level: 'Master 2', establishment: 'ESI Alger',
                        start_date: '2026-06-01', end_date: '2026-09-01',
                        status: 'waiting', con_status: 'pending',
                        convention_url: 'https://cloudinary.com/...'
                      }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Accès refusé ou impossible de déterminer l'entreprise" }
          }
        }
      },
      '/adminsec/interns': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste de tous les stagiaires de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Nécessite un access token valide appartenant à un admin secondaire.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des stagiaires',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 2,
                    interns: [
                      { id: 5, user_id: 12, company_id: 2, status: 'active', con_status: 'APPROVED' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Accès refusé ou impossible de déterminer l'entreprise" }
          }
        }
      },
      '/adminsec/interns/{internId}/approve': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Approuver un stagiaire',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Active le compte utilisateur et passe con_status à APPROVED. Le stagiaire doit être en statut 'pending'.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'internId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Intern ID' }
          ],
          responses: {
            200: {
              description: 'Stagiaire approuvé',
              content: {
                'application/json': {
                  example: { success: true, message: "Stagiaire approuvé. Veuillez maintenant lui attribuer un encadrant." }
                }
              }
            },
            400: { description: "Ce stagiaire n'est pas en attente de validation" },
            403: { description: "Non autorisé à gérer ce stagiaire (autre entreprise)" },
            404: { description: 'Stagiaire introuvable' }
          }
        }
      },
      '/adminsec/interns/{internId}/reject': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Refuser un stagiaire',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Désactive le compte utilisateur et passe con_status à rejected.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'internId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Intern ID' }
          ],
          responses: {
            200: {
              description: 'Inscription refusée',
              content: {
                'application/json': {
                  example: { success: true, message: 'Inscription du stagiaire refusée.' }
                }
              }
            },
            403: { description: "Non autorisé à gérer ce stagiaire (autre entreprise)" },
            404: { description: 'Stagiaire introuvable' }
          }
        }
      },
      '/adminsec/interns/{internId}/activate': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Activer manuellement un compte stagiaire',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN').",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'internId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Intern ID' }
          ],
          responses: {
            200: {
              description: 'Compte activé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Compte du stagiaire activé avec succès.' }
                }
              }
            },
            403: { description: "Non autorisé à gérer ce stagiaire (autre entreprise)" },
            404: { description: 'Stagiaire introuvable' }
          }
        }
      },
      '/adminsec/interns/{internId}/desactivate': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Désactiver un compte stagiaire',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN').",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'internId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Intern ID' }
          ],
          responses: {
            200: {
              description: 'Compte désactivé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Compte du stagiaire désactivé avec succès.' }
                }
              }
            },
            403: { description: "Non autorisé à gérer ce stagiaire (autre entreprise)" },
            404: { description: 'Stagiaire introuvable' }
          }
        }
      },
      '/adminsec/interns/{internId}/supervisor': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Affecter un encadrant à un stagiaire',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). L'encadrant est recherché par son nom (supervisorName) au sein de l'entreprise de l'admin connecté.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'internId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Intern ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AssignSupervisor' }
              }
            }
          },
          responses: {
            200: {
              description: 'Encadrant affecté',
              content: {
                'application/json': {
                  example: { success: true, message: 'Encadrant affecté avec succès.' }
                }
              }
            },
            403: { description: "Non autorisé à gérer ce stagiaire (autre entreprise)" },
            404: { description: 'Stagiaire ou encadrant introuvable' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // ADMIN SEC — ENCADRANTS
      // ══════════════════════════════════════════════
      '/adminsec/supervisors': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste des encadrants de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN').",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des encadrants',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    supervisors: [
                      { id: 3, user_id: 20, company_id: 2, job: 'Lead Developer', department: 'R&D', specialization: 'Backend Node.js', years_of_experience: 5 }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Accès refusé ou impossible de déterminer l'entreprise" }
          }
        }
      }
    }
  },
  apis: [],
};

// ─────────────────────────────────────────────
// Build spec
// ─────────────────────────────────────────────
const specs = swaggerJsdoc(options);

// ─────────────────────────────────────────────
// Mount UI
// ─────────────────────────────────────────────
export const swaggerSetup = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serveFiles(specs),
    swaggerUi.setup(specs, {
      customSiteTitle: 'StageLink — API Docs',
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    }),
  );

  console.log('Swagger StageLink → /api-docs');
};
