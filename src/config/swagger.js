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
        'API StageLink | Auth (inscription, connexion, OTP, mot de passe) · Admin Secondaire (gestion des stagiaires & encadrants) · Tâches & Activités (encadrant et stagiaire) · Super Admin (validation des entreprises) · Companies (liste publique) · Chat (conversations encadrant ↔ stagiaire) · Profil (consultation et modification) · Documents (création, modification, suppression, versions, reviews, recherche intelligente)',
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
        },

        // ── Tâches & Activités ────────────────────────
        CreateTacheBySupervisor: {
          type: 'object',
          required: ['intern_name', 'title', 'priority', 'end_date'],
          properties: {
            intern_name: { type: 'string', example: 'Katia Benali', description: "Nom du stagiaire ciblé (recherché par Intern.findByName)" },
            title: { type: 'string', example: 'Intégrer le module de paiement' },
            description: { type: 'string', example: 'Ajouter Stripe au checkout de la plateforme.' },
            priority: { type: 'string', example: 'high' },
            end_date: { type: 'string', format: 'date', example: '2026-06-15' }
          }
        },
        UpdateTacheBySupervisor: {
          type: 'object',
          description: 'Tous les champs sont optionnels — seuls les champs fournis sont mis à jour.',
          properties: {
            intern_name: { type: 'string', example: 'Katia Benali', description: 'Si fourni, réaffecte la tâche à un autre stagiaire' },
            title: { type: 'string', example: 'Intégrer le module de paiement (v2)' },
            description: { type: 'string', example: 'Ajouter Stripe + PayPal au checkout.' },
            priority: { type: 'string', example: 'medium' },
            end_date: { type: 'string', format: 'date', example: '2026-06-20' }
          }
        },
        CreateTacheByIntern: {
          type: 'object',
          required: ['title', 'priority', 'end_date'],
          properties: {
            title: { type: 'string', example: 'Corriger le bug de pagination' },
            description: { type: 'string', example: 'La pagination ne fonctionne pas sur mobile.' },
            priority: { type: 'string', example: 'low' },
            end_date: { type: 'string', format: 'date', example: '2026-06-10' }
          }
        },
        UpdateTacheByIntern: {
          type: 'object',
          description: 'Tous les champs sont optionnels — seuls les champs fournis sont mis à jour.',
          properties: {
            title: { type: 'string', example: 'Corriger le bug de pagination (mobile + tablette)' },
            description: { type: 'string', example: 'Étendre le correctif aux tablettes.' },
            priority: { type: 'string', example: 'medium' },
            end_date: { type: 'string', format: 'date', example: '2026-06-12' }
          }
        },
        CreateActivity: {
          type: 'object',
          required: ['title', 'interns', 'end_date'],
          properties: {
            title: { type: 'string', example: 'Sprint Planning' },
            description: { type: 'string', example: 'Planification du sprint 4 avec toute l\'équipe.' },
            interns: { type: 'string', example: 'Katia Benali, Ahmed Slimani', description: 'Nom(s) des stagiaires concernés (texte libre, recherché ensuite via ILIKE)' },
            priority: { type: 'string', example: 'medium', description: "Accepté par l'API mais non persisté en base actuellement (ignoré côté serveur)." },
            end_date: { type: 'string', format: 'date', example: '2026-06-05' }
          }
        },
        UpdateActivity: {
          type: 'object',
          description: 'Tous les champs sont optionnels — seuls les champs fournis sont mis à jour.',
          properties: {
            title: { type: 'string', example: 'Sprint Planning (reporté)' },
            description: { type: 'string', example: 'Planification déplacée à vendredi.' },
            interns: { type: 'string', example: 'Katia Benali, Ahmed Slimani' },
            end_date: { type: 'string', format: 'date', example: '2026-06-07' }
          }
        },

        // ── Chat ───────────────────────────────────────
        CreateConversation: {
          type: 'object',
          required: ['user_name'],
          properties: {
            user_name: {
              type: 'string',
              example: 'Katia Benali',
              description: "Nom exact de l'autre participant (stagiaire ou encadrant selon le rôle de l'utilisateur connecté). Recherché via User.findByName."
            }
          }
        },
        UpdateMessage: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string', example: 'En fait je peux venir demain matin.' }
          }
        },

        // ── Profil ─────────────────────────────────────
        UpdateMyProfile: {
          type: 'object',
          description:
            "Tous les champs sont optionnels — seuls les champs fournis sont mis à jour. 'name' et 'phone' s'appliquent à tous les rôles. Les champs job/department/specialization/years_of_experience ne sont pris en compte que si l'utilisateur connecté est SUPERVISOR. Les champs sector/studies_level/establishment/start_date/end_date ne sont pris en compte que si l'utilisateur connecté est INTERN (les envoyer pour un autre rôle n'a aucun effet).",
          properties: {
            profil_image: { type: 'string', format: 'binary', description: 'Nouvelle photo de profil (JPG ou PNG uniquement)' },
            name: { type: 'string', example: 'Katia Benali' },
            phone: { type: 'string', example: '0550000099' },
            job: { type: 'string', example: 'Lead Developer', description: 'SUPERVISOR uniquement' },
            department: { type: 'string', example: 'R&D', description: 'SUPERVISOR uniquement' },
            specialization: { type: 'string', example: 'Backend Node.js', description: 'SUPERVISOR uniquement' },
            years_of_experience: { type: 'integer', example: 6, description: 'SUPERVISOR uniquement' },
            sector: { type: 'string', example: 'Développement Web', description: 'INTERN uniquement' },
            studies_level: { type: 'string', example: 'Master 2', description: 'INTERN uniquement' },
            establishment: { type: 'string', example: 'ESI Alger', description: 'INTERN uniquement' },
            start_date: { type: 'string', format: 'date', example: '2026-06-01', description: 'INTERN uniquement' },
            end_date: { type: 'string', format: 'date', example: '2026-09-01', description: 'INTERN uniquement' }
          }
        },

        // ── Documents ──────────────────────────────────
        CreateDocument: {
          type: 'object',
          required: ['title', 'document_type'],
          properties: {
            title: { type: 'string', example: 'Rapport de stage - Semaine 1' },
            description: { type: 'string', example: 'Résumé des tâches effectuées durant la première semaine.' },
            document_type: { type: 'string', example: 'rapport_hebdomadaire' },
            task_title: { type: 'string', example: 'Intégrer le module de paiement', description: "Optionnel. Titre exact d'une tâche existante à lier au document (recherché via Taches.findByTitle). Si introuvable, le document est créé sans tâche liée (task_id = null)." }
          }
        },
        UpdateDocument: {
          type: 'object',
          description:
            "Toutes les propriétés sont optionnelles, mais AU MOINS UNE doit être fournie (sinon 400). Les champs non fournis conservent leur valeur actuelle (COALESCE côté SQL). Cette route ne modifie que les métadonnées du document : pour envoyer un nouveau fichier, utiliser POST /documents/{id}/versions.",
          properties: {
            title: { type: 'string', example: 'Rapport de stage - Semaine 1 (corrigé)' },
            description: { type: 'string', example: "Version corrigée après retour de l'encadrant." },
            document_type: { type: 'string', example: 'rapport_hebdomadaire' },
            task_id: {
              type: 'integer',
              example: 4,
              description: "Attention : ici c'est bien l'ID numérique de la tâche, contrairement à la création qui attend task_title."
            }
          }
        },
        AddDocumentVersion: {
          type: 'object',
          required: ['file'],
          properties: {
            file: { type: 'string', format: 'binary', description: 'Fichier de la nouvelle version du document (obligatoire)' }
          }
        },
        ReviewDocument: {
          type: 'object',
          required: ['version_id', 'status'],
          properties: {
            version_id: { type: 'integer', example: 3, description: "ID de la version du document concernée par la review. NOTE : le contrôleur compare actuellement cette valeur à version_number (1, 2, 3...) et non à l'id de la table document_versions." },
            status: { type: 'string', enum: ['APPROVED', 'REVISION_REQUIRED', 'REJECTED'], example: 'APPROVED' },
            comment: { type: 'string', example: 'Bon travail, quelques fautes à corriger page 2.' }
          }
        },

        // ── Appointments (Rendez-vous) ─────────────────
        CreateAppointment: {
          type: 'object',
          required: ['title', 'appointment_date', 'start_time', 'end_time', 'meeting_type'],
          description:
            "Créable par un STAGIAIRE ou un ENCADRANT (protect uniquement, pas de restrictTo). " +
            "Si le créateur est un STAGIAIRE : le rendez-vous est automatiquement proposé à SON encadrant assigné (supervisor_id du stagiaire) — le stagiaire doit déjà avoir un encadrant, sinon 400. Le champ intern_name est ignoré dans ce cas. " +
            "Si le créateur est un ENCADRANT : le champ intern_name devient OBLIGATOIRE afin de désigner le stagiaire concerné ; ce stagiaire doit lui être assigné, sinon 403 (ou 404 si le nom ne correspond à aucun stagiaire). " +
            "end_time doit être strictement supérieur à start_time (comparaison de chaînes, ex: '10:00' > '09:00'), sinon 400. " +
            "location est obligatoire si meeting_type = PRESENTIEL (sinon 400) ; meeting_link est obligatoire si meeting_type = VISIO (sinon 400). Le champ non pertinent (location pour un VISIO, meeting_link pour un PRESENTIEL) est ignoré et forcé à null côté serveur.",
          properties: {
            title: { type: 'string', example: 'Point hebdomadaire de suivi' },
            description: { type: 'string', example: "Faire le point sur l'avancement du module de paiement." },
            appointment_date: { type: 'string', format: 'date', example: '2026-06-10' },
            start_time: { type: 'string', example: '09:00', description: "Heure de début, format HH:mm (comparée en chaîne de caractères par le serveur)." },
            end_time: { type: 'string', example: '09:30', description: "Heure de fin, format HH:mm. Doit être strictement supérieure à start_time." },
            meeting_type: { type: 'string', enum: ['PRESENTIEL', 'VISIO'], example: 'VISIO' },
            location: { type: 'string', example: 'Salle de réunion R&D, 2e étage', description: "Obligatoire uniquement si meeting_type = PRESENTIEL." },
            meeting_link: { type: 'string', example: 'https://meet.google.com/abc-defg-hij', description: "Obligatoire uniquement si meeting_type = VISIO." },
            intern_name: { type: 'string', example: 'Katia Benali', description: "Obligatoire UNIQUEMENT si le créateur est un ENCADRANT (recherché via Intern.findByName). Ignoré si le créateur est un stagiaire." }
          }
        },
        RespondToAppointment: {
          type: 'object',
          required: ['action'],
          description:
            "Le rendez-vous doit être au statut PENDING, sinon 400. Seul le destinataire de la demande peut répondre : " +
            "si le rendez-vous a été créé par un STAGIAIRE, seul l'ENCADRANT concerné (supervisor_id) peut répondre ; " +
            "si créé par un ENCADRANT, seul le STAGIAIRE concerné (intern_id) peut répondre. Sinon 403.",
          properties: {
            action: { type: 'string', enum: ['ACCEPT', 'REJECT'], example: 'ACCEPT' },
            reason: { type: 'string', example: 'Indisponible à cet horaire, pouvons-nous décaler à 14h ?', description: "Motif de refus. Pris en compte uniquement si action = REJECT ; ignoré si action = ACCEPT." }
          }
        },
        CancelAppointment: {
          type: 'object',
          description:
            "Aucun champ obligatoire. Accessible au stagiaire ET à l'encadrant participant au rendez-vous (peu importe qui l'a créé). " +
            "Impossible d'annuler un rendez-vous déjà CANCELLED ou COMPLETED (400).",
          properties: {
            reason: { type: 'string', example: "Conflit d'agenda de dernière minute.", description: "Motif d'annulation, optionnel." }
          }
        },

        // ── Notifications ───────────────────────────────
        Notification: {
          type: 'object',
          description:
            "Schéma en LECTURE SEULE. Aucune route publique ne permet de créer une notification via body — Notification.create() n'est utilisé qu'en interne par le serveur (déclenché par d'autres actions, ex : nouvelle tâche, review, rendez-vous, etc.). Toutes les routes du groupe Notifications ci-dessous n'attendent AUCUN corps de requête.",
          properties: {
            id: { type: 'integer', example: 21 },
            user_id: { type: 'integer', example: 12, description: "Destinataire de la notification (toujours égal à l'utilisateur connecté pour toutes les routes de lecture/écriture)." },
            title: { type: 'string', example: 'Nouvelle tâche assignée' },
            message: { type: 'string', example: 'Amine Boudiaf vous a assigné la tâche "Intégrer le module de paiement".' },
            type: { type: 'string', example: 'TASK', description: "Catégorie libre définie par le code qui crée la notification (ex : TASK, DOCUMENT, APPOINTMENT, MESSAGE...). Pas de contrainte enum imposée en base d'après le modèle." },
            is_read: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time', example: '2026-06-05T08:00:00.000Z' }
          }
        },

        // ── AI ───────────────────────────────────────────
        AskAI: {
          type: 'object',
          required: ['question'],
          description:
            "Accessible uniquement aux STAGIAIRES et ENCADRANTS (company_id dérivé de req.internInfo?.company_id || req.supervisorInfo?.company_id ; 403 pour tout autre rôle, y compris les admins). " +
            "Le RAG interroge uniquement les documents de l'entreprise de l'utilisateur connecté.",
          properties: {
            question: {
              type: 'string',
              example: "Quel est le statut d'avancement du projet de gestion des stages ?",
              description: "Obligatoire. Refusée si vide ou composée uniquement d'espaces (400)."
            },
            conversationId: {
              type: 'integer',
              example: 14,
              description:
                "Optionnel. Si fourni, la question est ajoutée à une conversation existante — celle-ci doit appartenir à l'utilisateur connecté (403 sinon), et exister (404 sinon). " +
                "Si omis, une NOUVELLE conversation est automatiquement créée, avec pour titre les 80 premiers caractères de la question."
            }
          }
        },
        CompareProjects: {
          type: 'object',
          required: ['documentId1', 'documentId2'],
          description:
            "Accessible uniquement aux STAGIAIRES et ENCADRANTS (même règle de company_id que /ai/ask). " +
            "Les deux documents comparés doivent appartenir à la même entreprise que l'utilisateur connecté (vérifié dans le service compareProjects).",
          properties: {
            documentId1: { type: 'integer', example: 9, description: "ID du premier document. Obligatoire." },
            documentId2: { type: 'integer', example: 12, description: "ID du second document. Obligatoire et doit être DIFFÉRENT de documentId1 (sinon 400)." }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth' },
      { name: 'Admin Sec' },
      { name: 'Tâches & Activités' },
      { name: 'Super Admin' },
      { name: 'Companies' },
      { name: 'Chat' },
      { name: 'Profil' },
      { name: 'Documents' },
      { name: 'Appointments' },
      { name: 'Notifications' },
      { name: 'Statistiques' },
      { name: 'AI' },
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
      '/adminsec/interns/actives': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste des stagiaires actifs de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Filtre les stagiaires dont le compte utilisateur (is_active) est TRUE.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des stagiaires actifs',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    actinterns: [
                      { name: 'Katia Benali', email: 'katia.benali@example.com', intern_type: 'intern_PFE', sector: 'Développement Web', studies_level: 'Master 2', establishment: 'ESI Alger', status: 'active', con_status: 'APPROVED' }
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
      '/adminsec/interns/desactives': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste des stagiaires désactivés de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Filtre les stagiaires dont le compte utilisateur (is_active) est FALSE.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des stagiaires désactivés',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    desinterns: [
                      { name: 'Ahmed Slimani', email: 'ahmed.slimani@example.com', intern_type: 'intern_PFC', sector: 'Réseaux', studies_level: 'Licence 3', establishment: 'USTHB', status: 'waiting', con_status: 'rejected' }
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
      },
      '/adminsec/supervisors/actives': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste des encadrants actifs de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Filtre les encadrants dont le compte utilisateur (is_active) est TRUE.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des encadrants actifs',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    actinterns: [
                      { name: 'Amine Boudiaf', email: 'amine.boudiaf@example.com', job: 'Lead Developer', department: 'R&D', specialization: 'Backend Node.js', years_of_experience: 5 }
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
      '/adminsec/supervisors/desactives': {
        get: {
          tags: ['Admin Sec'],
          summary: "Liste des encadrants désactivés de l'entreprise",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Filtre les encadrants dont le compte utilisateur (is_active) est FALSE.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des encadrants désactivés',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    desinterns: [
                      { name: 'Sofiane Khaldi', email: 'sofiane.khaldi@example.com', job: 'DevOps Engineer', department: 'Infra', specialization: 'CI/CD', years_of_experience: 3 }
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
      '/adminsec/supervisors/{superId}/activate': {
        patch: {
          tags: ['Admin Sec'],
          summary: 'Activer le compte d\'un encadrant',
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'superId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Supervisor ID' }
          ],
          responses: {
            200: {
              description: 'Encadrant activé',
              content: {
                'application/json': {
                  example: { success: true, message: 'Encadrant activé.' }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise, ou l'encadrant appartient à une autre entreprise" },
            404: { description: 'Encadrant introuvable' }
          }
        }
      },
      '/adminsec/supervisors/{superId}/desactivate': {
        patch: {
          tags: ['Admin Sec'],
          summary: "Désactiver le compte d'un encadrant",
          description: "Protégé par protect + restrictTo('SECONDARY_ADMIN'). Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'superId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Supervisor ID' }
          ],
          responses: {
            200: {
              description: 'Encadrant désactivé',
              content: {
                'application/json': {
                  example: { success: true, message: "Compte de l'encadrant désactivé avec succès." }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise, ou l'encadrant appartient à une autre entreprise" },
            404: { description: 'Encadrant introuvable' }
          }
        }
      },
      // Toutes les routes nécessitent : protect
      // ══════════════════════════════════════════════
      '/actandtach/sup/taches': {
        get: {
          tags: ['Tâches & Activités'],
          summary: "Liste des tâches créées par l'encadrant connecté",
          description: "Protégé par protect. Nécessite req.supervisorInfo (utilisateur avec un profil encadrant).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des tâches',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    taches: [
                      { id: 4, company_id: 2, supervisor_id: 3, intern_id: 5, title: 'Intégrer le module de paiement', description: 'Ajouter Stripe au checkout.', priority: 'high', end_date: '2026-06-15', status: 'in progress' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" }
          }
        }
      },
      '/actandtach/sup/activities': {
        get: {
          tags: ['Tâches & Activités'],
          summary: "Liste des activités créées par l'encadrant connecté",
          description: "Protégé par protect. Nécessite req.supervisorInfo (utilisateur avec un profil encadrant).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des activités',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    activities: [
                      { id: 2, company_id: 2, supervisor_id: 3, interns: 'Katia Benali, Ahmed Slimani', title: 'Sprint Planning', description: "Planification du sprint 4.", end_date: '2026-06-05' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" }
          }
        }
      },
      '/actandtach/sup/new_tache': {
        post: {
          tags: ['Tâches & Activités'],
          summary: "Créer une tâche pour un stagiaire (par l'encadrant)",
          description: "Protégé par protect. Le stagiaire cible est recherché par son nom (intern_name).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTacheBySupervisor' }
              }
            }
          },
          responses: {
            201: {
              description: 'Tâche créée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    tache: { id: 4, company_id: 2, supervisor_id: 3, intern_id: 5, title: 'Intégrer le module de paiement', description: 'Ajouter Stripe au checkout.', priority: 'high', end_date: '2026-06-15', status: 'in progress' }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" },
            404: { description: 'Stagiaire introuvable (intern_name ne correspond à aucun stagiaire)' }
          }
        }
      },
      '/actandtach/sup/modify_tache/{tacheId}': {
        patch: {
          tags: ['Tâches & Activités'],
          summary: "Modifier une tâche (par l'encadrant)",
          description: "Protégé par protect. Les champs non fournis conservent leur valeur actuelle. Si intern_name est fourni, la tâche est réaffectée à ce stagiaire.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'tacheId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Tache ID' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTacheBySupervisor' }
              }
            }
          },
          responses: {
            200: {
              description: 'Tâche modifiée',
              content: {
                'application/json': {
                  example: { success: true, message: 'La tâche est modifiée avec succès !' }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" },
            404: { description: 'Tâche introuvable' }
          }
        }
      },
      '/actandtach/sup/delete_tache/{tacheId}': {
        delete: {
          tags: ['Tâches & Activités'],
          summary: "Supprimer une tâche (par l'encadrant)",
          description: 'Protégé par protect.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'tacheId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Tache ID' }
          ],
          responses: {
            200: {
              description: 'Tâche supprimée',
              content: {
                'application/json': {
                  example: { success: true, message: 'La tâche est supprimée avec succès !' }
                }
              }
            },
            403: { description: "La tâche n'existe pas, ou impossible de déterminer l'entreprise / l'utilisateur n'est pas encadrant" }
          }
        }
      },
      '/actandtach/sup/new_activity': {
        post: {
          tags: ['Tâches & Activités'],
          summary: "Créer une activité (par l'encadrant)",
          description: 'Protégé par protect. Note : le champ "priority" est accepté dans le body mais actuellement ignoré par le serveur (non stocké en base).',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateActivity' }
              }
            }
          },
          responses: {
            201: {
              description: 'Activité créée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    activity: { id: 2, company_id: 2, supervisor_id: 3, interns: 'Katia Benali, Ahmed Slimani', title: 'Sprint Planning', description: "Planification du sprint 4.", end_date: '2026-06-05' }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" }
          }
        }
      },
      '/actandtach/sup/modify_activity/{activityId}': {
        patch: {
          tags: ['Tâches & Activités'],
          summary: "Modifier une activité (par l'encadrant)",
          description: "Protégé par protect. Les champs non fournis conservent leur valeur actuelle.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'activityId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Activity ID' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateActivity' }
              }
            }
          },
          responses: {
            200: {
              description: 'Activité modifiée',
              content: {
                'application/json': {
                  example: { success: true, message: "L'activité est modifiée avec succès !" }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas encadrant" },
            404: { description: 'Activité introuvable' }
          }
        }
      },
      '/actandtach/sup/delete_activity/{activityId}': {
        delete: {
          tags: ['Tâches & Activités'],
          summary: "Supprimer une activité (par l'encadrant)",
          description: 'Protégé par protect.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'activityId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Activity ID' }
          ],
          responses: {
            200: {
              description: 'Activité supprimée',
              content: {
                'application/json': {
                  example: { success: true, message: "L'activité est supprimée avec succès !" }
                }
              }
            },
            403: { description: "L'activité n'existe pas, ou impossible de déterminer l'entreprise / l'utilisateur n'est pas encadrant" }
          }
        }
      },

      // ══════════════════════════════════════════════
      // TÂCHES — STAGIAIRE (INTERN)
      // Toutes les routes nécessitent : protect
      // ══════════════════════════════════════════════
      '/actandtach/int/taches': {
        get: {
          tags: ['Tâches & Activités'],
          summary: 'Liste des tâches assignées au stagiaire connecté',
          description: 'Protégé par protect. Nécessite req.internInfo (utilisateur avec un profil stagiaire).',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des tâches',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    taches: [
                      { id: 4, company_id: 2, supervisor_id: 3, intern_id: 5, title: 'Intégrer le module de paiement', description: 'Ajouter Stripe au checkout.', priority: 'high', end_date: '2026-06-15', status: 'in progress' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas stagiaire" }
          }
        }
      },
      '/actandtach/int/activities': {
        get: {
          tags: ['Tâches & Activités'],
          summary: 'Liste des activités où le stagiaire connecté est impliqué',
          description: "Protégé par protect. La recherche se fait par correspondance du nom du stagiaire (ILIKE) dans le champ interns.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des activités',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    count: 1,
                    activities: [
                      { id: 2, company_id: 2, supervisor_id: 3, interns: 'Katia Benali, Ahmed Slimani', title: 'Sprint Planning', description: "Planification du sprint 4.", end_date: '2026-06-05' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas stagiaire" }
          }
        }
      },
      '/actandtach/interns/new_tache': {
        post: {
          tags: ['Tâches & Activités'],
          summary: 'Créer une tâche pour soi-même (par le stagiaire)',
          description: "Protégé par protect. Le stagiaire doit avoir un encadrant déjà assigné (supervisor_id), sinon 400.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateTacheByIntern' }
              }
            }
          },
          responses: {
            201: {
              description: 'Tâche créée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    tache: { id: 6, company_id: 2, supervisor_id: 3, intern_id: 5, title: 'Corriger le bug de pagination', description: 'La pagination ne fonctionne pas sur mobile.', priority: 'low', end_date: '2026-06-10', status: 'in progress' }
                  }
                }
              }
            },
            400: { description: "Aucun encadrant n'est assigné à ce stagiaire" },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas stagiaire" },
            404: { description: 'Stagiaire introuvable' }
          }
        }
      },
      '/actandtach/interns/modify_tache/{tacheId}': {
        patch: {
          tags: ['Tâches & Activités'],
          summary: 'Modifier sa propre tâche (par le stagiaire)',
          description: "Protégé par protect. Les champs non fournis conservent leur valeur actuelle.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'tacheId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Tache ID' }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateTacheByIntern' }
              }
            }
          },
          responses: {
            200: {
              description: 'Tâche modifiée',
              content: {
                'application/json': {
                  example: { success: true, message: 'La tâche est modifiée avec succès !' }
                }
              }
            },
            403: { description: "Impossible de déterminer l'entreprise ou l'utilisateur n'est pas stagiaire" },
            404: { description: 'Tâche introuvable' }
          }
        }
      },
      '/actandtach/interns/delete_tache/{tacheId}': {
        delete: {
          tags: ['Tâches & Activités'],
          summary: 'Supprimer sa propre tâche (par le stagiaire)',
          description: 'Protégé par protect.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'tacheId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Tache ID' }
          ],
          responses: {
            200: {
              description: 'Tâche supprimée',
              content: {
                'application/json': {
                  example: { success: true, message: 'La tâche est supprimée avec succès !' }
                }
              }
            },
            403: { description: "La tâche n'existe pas, ou impossible de déterminer l'entreprise / l'utilisateur n'est pas stagiaire" }
          }
        }
      },

      // ══════════════════════════════════════════════
      // SUPER ADMIN — GESTION DES ENTREPRISES
      // Toutes les routes nécessitent : protect + restrictTo("SUPER_ADMIN")
      // Aucune de ces routes n'attend de body.
      // ══════════════════════════════════════════════
      '/adminsup/companies': {
        get: {
          tags: ['Super Admin'],
          summary: 'Liste de toutes les entreprises (tous statuts confondus)',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN').",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des entreprises',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    companies: [
                      {
                        id: 2, user_id: 8, name: 'TechCorp', address: '12 Rue des Frères, Alger',
                        logo: 'https://cloudinary.com/...', description: 'Entreprise spécialisée dans le développement logiciel.',
                        website_URL: 'https://techcorp.dz', registration_number: 'RC-2023-00123',
                        company_email: 'contact@techcorp.dz', company_phone: '0213000000',
                        company_status: 'pending'
                      }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' }
          }
        }
      },
      '/adminsup/companies/pending': {
        get: {
          tags: ['Super Admin'],
          summary: 'Liste des entreprises en attente de validation',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN').",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des entreprises en attente',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    companies: [
                      { id: 2, user_id: 8, name: 'TechCorp', company_email: 'contact@techcorp.dz', company_status: 'pending' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' }
          }
        }
      },
      '/adminsup/companies/approved': {
        get: {
          tags: ['Super Admin'],
          summary: 'Liste des entreprises approuvées (vue Super Admin)',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN').",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des entreprises approuvées',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    companies: [
                      { id: 1, user_id: 4, name: 'InnovaSoft', company_email: 'contact@innovasoft.dz', company_status: 'APPROVED' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' }
          }
        }
      },
      '/adminsup/companies/{id}/approve': {
        patch: {
          tags: ['Super Admin'],
          summary: 'Approuver une entreprise',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN'). Active également le compte du SECONDARY_ADMIN associé. Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Company ID' }
          ],
          responses: {
            200: {
              description: 'Entreprise approuvée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Company approved successfully',
                    company: { id: 2, name: 'TechCorp', company_status: 'APPROVED' }
                  }
                }
              }
            },
            400: { description: 'Company is already approved' },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' },
            404: { description: 'Company not found' }
          }
        }
      },
      '/adminsup/companies/{id}/reject': {
        patch: {
          tags: ['Super Admin'],
          summary: 'Rejeter une entreprise',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN'). Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Company ID' }
          ],
          responses: {
            200: {
              description: 'Entreprise rejetée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Company rejected successfully',
                    company: { id: 2, name: 'TechCorp', company_status: 'REJECTED' }
                  }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' },
            404: { description: 'Company not found' }
          }
        }
      },
      '/adminsup/companies/{id}': {
        delete: {
          tags: ['Super Admin'],
          summary: 'Supprimer une entreprise',
          description: "Protégé par protect + restrictTo('SUPER_ADMIN').",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Company ID' }
          ],
          responses: {
            200: {
              description: 'Entreprise supprimée',
              content: {
                'application/json': {
                  example: { success: true, message: 'Company deleted successfully' }
                }
              }
            },
            401: { description: 'Non authentifié' },
            403: { description: 'Accès refusé (rôle différent de SUPER_ADMIN)' },
            404: { description: 'Company not found' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // COMPANIES — LISTE PUBLIQUE
      // Route publique, aucun token requis.
      // ══════════════════════════════════════════════
      '/companies/approved': {
        get: {
          tags: ['Companies'],
          summary: 'Liste publique des entreprises approuvées',
          description: "Route publique — utilisée par exemple pour peupler le champ 'company_name' lors de l'inscription d'un stagiaire ou d'un encadrant. Aucun token requis.",
          security: [],
          responses: {
            200: {
              description: 'Liste des entreprises approuvées',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    companies: [
                      { id: 1, name: 'InnovaSoft', logo: 'https://cloudinary.com/...', company_status: 'APPROVED' },
                      { id: 2, name: 'TechCorp', logo: 'https://cloudinary.com/...', company_status: 'APPROVED' }
                    ]
                  }
                }
              }
            },
            500: { description: 'Erreur serveur' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // CHAT — CONVERSATIONS ENCADRANT <-> STAGIAIRE
      // Toutes les routes nécessitent : protect
      // ══════════════════════════════════════════════
      '/chat/conversations': {
        post: {
          tags: ['Chat'],
          summary: 'Obtenir ou créer une conversation avec un utilisateur',
          description: "Protégé par protect. L'utilisateur connecté doit être soit un encadrant, soit un stagiaire. Le champ user_name désigne l'AUTRE participant (le stagiaire si l'appelant est l'encadrant, ou l'encadrant si l'appelant est le stagiaire). Les deux doivent être liés (même entreprise, et le stagiaire doit avoir cet encadrant assigné).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateConversation' }
              }
            }
          },
          responses: {
            200: {
              description: 'Conversation récupérée ou créée',
              content: {
                'application/json': {
                  example: {
                    message: 'Conversation récupérée avec succès.',
                    conversation: { id: 7, supervisor_id: 3, intern_id: 5, created_at: '2026-05-01T10:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: "user_name manquant, tentative de conversation avec soi-même, ou le stagiaire n'a pas encore de superviseur" },
            403: { description: "Le destinataire ne correspond pas au bon rôle attendu, n'est pas affecté à l'utilisateur, ou entreprises différentes. Aussi renvoyé si l'utilisateur n'est ni encadrant ni stagiaire." },
            404: { description: "Utilisateur cible introuvable, ou n'est pas du rôle attendu (pas stagiaire / pas encadrant)" },
            500: { description: 'Erreur serveur' }
          }
        },
        get: {
          tags: ['Chat'],
          summary: 'Liste de mes conversations',
          description: "Protégé par protect. Retourne les conversations selon que l'utilisateur connecté est encadrant ou stagiaire.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des conversations',
              content: {
                'application/json': {
                  example: {
                    conversations: [
                      { id: 7, supervisor_id: 3, intern_id: 5, created_at: '2026-05-01T10:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            403: { description: 'Utilisateur non autorisé à utiliser le chat (ni encadrant ni stagiaire)' },
            500: { description: 'Erreur serveur' }
          }
        }
      },
      '/chat/conversations/{conversationId}/messages': {
        get: {
          tags: ['Chat'],
          summary: "Messages d'une conversation",
          description: "Protégé par protect. Marque automatiquement les messages comme lus pour l'utilisateur connecté après récupération.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'conversationId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Conversation ID' }
          ],
          responses: {
            200: {
              description: 'Conversation + messages',
              content: {
                'application/json': {
                  example: {
                    conversation: { id: 7, supervisor_id: 3, intern_id: 5, supervisor_user_id: 20, intern_user_id: 12 },
                    messages: [
                      { id: 15, conversation_id: 7, sender_id: 12, content: 'Bonjour, je serai en retard demain.', is_read: true, created_at: '2026-05-02T09:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            403: { description: "Accès refusé à cette conversation (l'utilisateur n'en fait pas partie)" },
            404: { description: 'Conversation introuvable' },
            500: { description: 'Erreur serveur' }
          }
        }
      },
      '/chat/messages/{messageId}': {
        patch: {
          tags: ['Chat'],
          summary: 'Modifier mon message',
          description: 'Protégé par protect. Seul l\'auteur du message peut le modifier.',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'messageId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Message ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateMessage' }
              }
            }
          },
          responses: {
            200: {
              description: 'Message modifié',
              content: {
                'application/json': {
                  example: {
                    message: 'Message modifié avec succès.',
                    updatedMessage: { id: 15, conversation_id: 7, sender_id: 12, content: 'En fait je peux venir demain matin.', updated_at: '2026-05-02T09:05:00.000Z' }
                  }
                }
              }
            },
            400: { description: 'Le contenu du message est obligatoire (vide ou manquant)' },
            404: { description: "Message introuvable ou l'utilisateur n'en est pas l'auteur" },
            500: { description: 'Erreur serveur' }
          }
        },
        delete: {
          tags: ['Chat'],
          summary: 'Supprimer mon message',
          description: "Protégé par protect. Seul l'auteur du message peut le supprimer.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'messageId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Message ID' }
          ],
          responses: {
            200: {
              description: 'Message supprimé',
              content: {
                'application/json': {
                  example: {
                    message: 'Message supprimé avec succès.',
                    deletedMessage: { id: 15, conversation_id: 7, sender_id: 12, content: 'Bonjour, je serai en retard demain.' }
                  }
                }
              }
            },
            404: { description: "Message introuvable ou l'utilisateur n'en est pas l'auteur" },
            500: { description: 'Erreur serveur' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // PROFIL
      // Toutes les routes nécessitent : protect
      // ══════════════════════════════════════════════
      '/profile': {
        get: {
          tags: ['Profil'],
          summary: 'Mon profil',
          description: "Protégé par protect. Retourne le profil complet enrichi selon le rôle (INTERN, SUPERVISOR, SECONDARY_ADMIN, SUPER_ADMIN).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profil récupéré',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    role: 'INTERN',
                    profile: {
                      id: 12, name: 'Katia Benali', email: 'katia.benali@example.com', phone: '0550000011',
                      company_id: 2, sector: 'Développement Web', studies_level: 'Master 2',
                      establishment: 'ESI Alger', start_date: '2026-06-01', end_date: '2026-09-01'
                    }
                  }
                }
              }
            },
            404: { description: 'Profil introuvable' },
            500: { description: 'Erreur lors de la récupération du profil' }
          }
        }
      },
      '/profile/me': {
        patch: {
          tags: ['Profil'],
          summary: 'Modifier mon profil',
          description: "Protégé par protect. Les champs communs (name, phone) s'appliquent à tous les rôles ; les autres champs ne sont pris en compte que pour le rôle correspondant (voir schema).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/UpdateMyProfile' }
              }
            }
          },
          responses: {
            200: {
              description: 'Profil modifié',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Profil modifié avec succès.',
                    profile: { id: 12, name: 'Katia Benali', phone: '0550000099', sector: 'Développement Web' }
                  }
                }
              }
            },
            400: { description: 'La photo de profil doit être au format JPG ou PNG' },
            403: { description: 'Rôle introuvable' },
            500: { description: 'Erreur lors de la modification du profil' }
          }
        }
      },
      '/profile/{userId}': {
        get: {
          tags: ['Profil'],
          summary: "Profil d'un autre utilisateur",
          description: "Protégé par protect. Le SUPER_ADMIN peut consulter n'importe quel profil. Les autres rôles ne peuvent consulter que les profils appartenant à leur propre entreprise.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'userId', in: 'path', required: true, schema: { type: 'integer' }, description: 'User ID' }
          ],
          responses: {
            200: {
              description: 'Profil récupéré',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    profile: { id: 20, name: 'Amine Boudiaf', email: 'amine.boudiaf@example.com', company_id: 2, job: 'Lead Developer' }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer votre entreprise, ou le profil demandé appartient à une autre entreprise" },
            404: { description: 'Profil introuvable' },
            500: { description: 'Erreur lors de la récupération du profil' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // DOCUMENTS — STAGIAIRE (créer, consulter, versionner)
      // ══════════════════════════════════════════════
      '/documents': {
        post: {
          tags: ['Documents'],
          summary: 'Créer un document',
          description: "Protégé par protect + restrictTo('INTERN'). Si task_title est fourni mais ne correspond à aucune tâche existante, le document est quand même créé (task_id = null), sans erreur.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateDocument' }
              }
            }
          },
          responses: {
            201: {
              description: 'Document créé',
              content: {
                'application/json': {
                  example: {
                    message: 'Document créé avec succès.',
                    document: { id: 9, intern_id: 5, task_id: 4, title: 'Rapport de stage - Semaine 1', description: 'Résumé des tâches effectuées durant la première semaine.', document_type: 'rapport_hebdomadaire', status: null, created_at: '2026-06-02T10:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: 'Titre ou type de document manquant' },
            403: { description: "Seul un stagiaire peut créer un document (token d'un autre rôle)" }
          }
        }
      },
      '/documents/pending': {
        get: {
          tags: ['Documents'],
          summary: 'Documents en attente de review',
          description: "Protégé par protect + restrictTo('SUPERVISOR'). Retourne les documents au statut PENDING des stagiaires assignés à l'encadrant connecté, avec la dernière version jointe.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Documents en attente',
              content: {
                'application/json': {
                  example: {
                    message: 'Documents en attente récupérés avec succès.',
                    documents: [
                      {
                        id: 9, title: 'Rapport de stage - Semaine 1', description: '...', document_type: 'rapport_hebdomadaire',
                        status: 'PENDING', task_id: 4, created_at: '2026-06-02T10:00:00.000Z', updated_at: '2026-06-02T10:00:00.000Z',
                        intern_id: 5, intern_name: 'Katia Benali', intern_email: 'katia.benali@example.com',
                        version_id: 3, version_number: 1, file_name: 'rapport_s1.pdf', file_url: 'https://cloudinary.com/...', version_created_at: '2026-06-02T10:05:00.000Z'
                      }
                    ]
                  }
                }
              }
            },
            403: { description: 'Accès réservé aux superviseurs' }
          }
        }
      },
      '/documents/my': {
        get: {
          tags: ['Documents'],
          summary: 'Mes documents',
          description: "Protégé par protect + restrictTo('INTERN').",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des documents du stagiaire connecté',
              content: {
                'application/json': {
                  example: {
                    message: 'Documents récupérés avec succès.',
                    documents: [
                      { id: 9, intern_id: 5, task_id: 4, title: 'Rapport de stage - Semaine 1', document_type: 'rapport_hebdomadaire', status: 'PENDING', created_at: '2026-06-02T10:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            403: { description: 'Accès réservé aux stagiaires' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // DOCUMENTS — RECHERCHE INTELLIGENTE
      // protect uniquement — comportement selon le rôle
      // ══════════════════════════════════════════════
      '/documents/search': {
        get: {
          tags: ['Documents'],
          summary: 'Recherche intelligente dans les documents',
          description:
            "Protégé par protect uniquement (pas de restrictTo) : le comportement dépend du rôle détecté. " +
            "Si l'utilisateur est un STAGIAIRE, la recherche est limitée à ses propres documents (Document.searchByIntern). " +
            "Si l'utilisateur est un ENCADRANT, la recherche porte sur les documents des stagiaires qui lui sont assignés (Document.searchBySupervisor). " +
            "Tout autre rôle reçoit un 403. " +
            "La recherche s'effectue sur le titre, la description, le nom du fichier et le CONTENU TEXTE des versions (extrait automatiquement à l'upload), " +
            "avec correspondance exacte (ILIKE) et correspondance approximative (similarity / pg_trgm, seuil 0.3) activée uniquement si le terme fait au moins 4 caractères. " +
            "Les résultats sont triés par relevance_score décroissant puis par updated_at décroissant. Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string', example: 'paiement' },
              description: "Terme de recherche. Obligatoire et non vide (une chaîne composée uniquement d'espaces est refusée → 400). Le terme est trimé avant traitement et renvoyé dans la réponse sous la clé 'search'."
            }
          ],
          responses: {
            200: {
              description: 'Résultats de la recherche (exemple côté encadrant)',
              content: {
                'application/json': {
                  example: {
                    message: 'Recherche effectuée avec succès.',
                    search: 'paiement',
                    documents: [
                      {
                        id: 9, intern_id: 5, task_id: 4,
                        title: 'Rapport de stage - Semaine 1',
                        description: 'Résumé des tâches effectuées durant la première semaine.',
                        document_type: 'rapport_hebdomadaire',
                        status: 'PENDING',
                        created_at: '2026-06-02T10:00:00.000Z',
                        updated_at: '2026-06-03T14:00:00.000Z',
                        intern_name: 'Katia Benali',
                        version_id: 4, version_number: 2,
                        file_name: 'rapport_s1_v2.pdf',
                        file_url: 'https://cloudinary.com/...',
                        relevance_score: 0.9
                      }
                    ]
                  }
                }
              }
            },
            400: { description: "Le terme de recherche (q) est manquant ou vide" },
            403: { description: "Accès refusé : l'utilisateur connecté n'est ni stagiaire ni encadrant" }
          }
        }
      },

      '/documents/{id}': {
        get: {
          tags: ['Documents'],
          summary: "Détails d'un document",
          description: "Protégé par protect + restrictTo('INTERN'). Le document doit appartenir au stagiaire connecté.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          responses: {
            200: {
              description: 'Document récupéré',
              content: {
                'application/json': {
                  example: {
                    message: 'Document récupéré avec succès.',
                    document: { id: 9, intern_id: 5, task_id: 4, title: 'Rapport de stage - Semaine 1', document_type: 'rapport_hebdomadaire', status: 'PENDING' }
                  }
                }
              }
            },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        },
        put: {
          tags: ['Documents'],
          summary: 'Modifier un document',
          description:
            "Protégé par protect + restrictTo('INTERN'). Le document doit appartenir au stagiaire connecté. " +
            "Au moins un des champs title, description, document_type ou task_id doit être fourni, sinon 400. " +
            "Les champs non fournis conservent leur valeur actuelle (COALESCE). " +
            "Cette route ne modifie que les métadonnées : pour envoyer un nouveau fichier, utiliser POST /documents/{id}/versions.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateDocument' }
              }
            }
          },
          responses: {
            200: {
              description: 'Document modifié',
              content: {
                'application/json': {
                  example: {
                    message: 'Document modifié avec succès.',
                    document: {
                      id: 9, intern_id: 5, task_id: 4,
                      title: 'Rapport de stage - Semaine 1 (corrigé)',
                      description: "Version corrigée après retour de l'encadrant.",
                      document_type: 'rapport_hebdomadaire',
                      status: 'PENDING',
                      created_at: '2026-06-02T10:00:00.000Z',
                      updated_at: '2026-06-04T09:00:00.000Z'
                    }
                  }
                }
              }
            },
            400: { description: 'Aucun champ fourni (title, description, document_type et task_id tous absents)' },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        },
        delete: {
          tags: ['Documents'],
          summary: 'Supprimer un document',
          description:
            "Protégé par protect + restrictTo('INTERN'). Le document doit appartenir au stagiaire connecté. Aucun body attendu. " +
            "Supprime également tous les fichiers associés sur Cloudinary (toutes les versions ayant un public_id) avant la suppression en base.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          responses: {
            200: {
              description: 'Document supprimé',
              content: {
                'application/json': {
                  example: { message: 'Document supprimé avec succès.' }
                }
              }
            },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        }
      },
      '/documents/{id}/versions': {
        get: {
          tags: ['Documents'],
          summary: "Versions d'un document",
          description: "Protégé par protect + restrictTo('INTERN'). Le document doit appartenir au stagiaire connecté.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          responses: {
            200: {
              description: 'Liste des versions',
              content: {
                'application/json': {
                  example: {
                    message: 'Versions récupérées avec succès.',
                    versions: [
                      { id: 3, document_id: 9, version_number: 1, file_name: 'rapport_s1.pdf', file_url: 'https://cloudinary.com/...', uploaded_by: 12, created_at: '2026-06-02T10:05:00.000Z' }
                    ]
                  }
                }
              }
            },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        },
        post: {
          tags: ['Documents'],
          summary: 'Ajouter une nouvelle version au document',
          description: "Protégé par protect + restrictTo('INTERN'). Le numéro de version est calculé automatiquement (dernière version + 1). Le contenu texte du fichier est extrait et stocké (utilisé par la recherche intelligente). Repasse le document au statut PENDING.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/AddDocumentVersion' }
              }
            }
          },
          responses: {
            201: {
              description: 'Nouvelle version ajoutée',
              content: {
                'application/json': {
                  example: {
                    message: 'Version V2 ajoutée avec succès.',
                    version: { id: 4, document_id: 9, version_number: 2, file_name: 'rapport_s1_v2.pdf', file_url: 'https://cloudinary.com/...', public_id: 'documents/abc123', resource_type: 'raw', uploaded_by: 12, created_at: '2026-06-03T14:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: 'Aucun fichier envoyé' },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // DOCUMENTS — VERSION PRÉCISE (stagiaire OU encadrant)
      // ══════════════════════════════════════════════
      '/documents/{id}/versions/{versionId}': {
        get: {
          tags: ['Documents'],
          summary: "Détails d'une version précise",
          description:
            "Protégé par protect uniquement (pas de restrictTo) : accessible au STAGIAIRE propriétaire du document ET à l'ENCADRANT auquel ce stagiaire est assigné. " +
            "Tout autre rôle reçoit un 403. Aucun body attendu. La version demandée doit appartenir au document indiqué, sinon 403.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' },
            { name: 'versionId', in: 'path', required: true, schema: { type: 'integer' }, description: "ID de la version (colonne id de document_versions, PAS le version_number)" }
          ],
          responses: {
            200: {
              description: 'Version récupérée',
              content: {
                'application/json': {
                  example: {
                    message: 'Version récupérée avec succès.',
                    version: {
                      id: 4, document_id: 9, version_number: 2,
                      file_name: 'rapport_s1_v2.pdf',
                      file_url: 'https://cloudinary.com/...',
                      public_id: 'documents/abc123',
                      resource_type: 'raw',
                      uploaded_by: 12,
                      created_at: '2026-06-03T14:00:00.000Z'
                    }
                  }
                }
              }
            },
            403: { description: "Accès refusé : document d'un autre stagiaire, encadrant non assigné à ce stagiaire, rôle non autorisé, ou la version n'appartient pas à ce document" },
            404: { description: 'Document ou version introuvable' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // DOCUMENTS — ENCADRANT (review)
      // ══════════════════════════════════════════════
      '/documents/{id}/review': {
        post: {
          tags: ['Documents'],
          summary: 'Évaluer une version de document',
          description: "Protégé par protect + restrictTo('SUPERVISOR'). Le document doit appartenir à un stagiaire assigné à l'encadrant connecté. Le statut du document est mis à jour avec le statut de la review.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReviewDocument' }
              }
            }
          },
          responses: {
            201: {
              description: 'Review enregistrée',
              content: {
                'application/json': {
                  example: {
                    message: 'Review enregistrée avec succès.',
                    review: { id: 2, document_id: 9, version_id: 3, supervisor_id: 3, comment: 'Bon travail, quelques fautes à corriger page 2.', status: 'APPROVED', created_at: '2026-06-03T15:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: "version_id ou status manquant, statut invalide, ou la version n'appartient pas à ce document" },
            403: { description: "Accès réservé aux superviseurs, ou ce document n'appartient pas à un stagiaire assigné à l'encadrant connecté" },
            404: { description: 'Document introuvable' }
          }
        }
      },
      '/documents/{id}/reviews': {
        get: {
          tags: ['Documents'],
          summary: "Historique des reviews d'un document",
          description: "Protégé par protect + restrictTo('INTERN'). Le document doit appartenir au stagiaire connecté.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          responses: {
            200: {
              description: 'Liste des reviews',
              content: {
                'application/json': {
                  example: {
                    message: 'Reviews récupérées avec succès.',
                    reviews: [
                      { id: 2, document_id: 9, version_id: 3, supervisor_id: 3, comment: 'Bon travail, quelques fautes à corriger page 2.', status: 'APPROVED', created_at: '2026-06-03T15:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            403: { description: "Accès réservé aux stagiaires, ou ce document n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Document introuvable' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // APPOINTMENTS — RENDEZ-VOUS STAGIAIRE <-> ENCADRANT
      // Toutes les routes nécessitent : protect
      // Aucun restrictTo : le rôle (INTERN / SUPERVISOR) est
      // détecté via req.internInfo / req.supervisorInfo.
      // ══════════════════════════════════════════════
      '/appointments': {
        post: {
          tags: ['Appointments'],
          summary: 'Créer un rendez-vous',
          description:
            "Protégé par protect uniquement. Peut être créé par un STAGIAIRE ou un ENCADRANT — voir le schéma CreateAppointment pour le détail des règles conditionnelles sur intern_name, location et meeting_link. " +
            "Le rendez-vous est créé avec le statut PENDING (valeur par défaut en base) et created_by vaut 'INTERN' ou 'SUPERVISOR' selon le créateur.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateAppointment' }
              }
            }
          },
          responses: {
            201: {
              description: 'Rendez-vous créé',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Rendez-vous créé avec succès.',
                    appointment: {
                      id: 3, intern_id: 5, supervisor_id: 3,
                      title: 'Point hebdomadaire de suivi',
                      description: "Faire le point sur l'avancement du module de paiement.",
                      appointment_date: '2026-06-10', start_time: '09:00', end_time: '09:30',
                      meeting_type: 'VISIO', location: null, meeting_link: 'https://meet.google.com/abc-defg-hij',
                      status: 'PENDING', created_by: 'INTERN', created_at: '2026-06-05T08:00:00.000Z'
                    }
                  }
                }
              }
            },
            400: { description: "Champ obligatoire manquant, meeting_type invalide, end_time <= start_time, location manquant (PRESENTIEL), meeting_link manquant (VISIO), stagiaire sans encadrant assigné, ou intern_name manquant (créateur encadrant)" },
            403: { description: "Ni stagiaire ni encadrant, ou (côté encadrant) le stagiaire visé ne lui est pas assigné" },
            404: { description: "Stagiaire introuvable (intern_name ne correspond à aucun stagiaire)" }
          }
        }
      },
      '/appointments/intern': {
        get: {
          tags: ['Appointments'],
          summary: 'Mes rendez-vous (stagiaire)',
          description: "Protégé par protect. Accès réservé aux stagiaires (403 si req.internInfo est absent). Retourne tous les rendez-vous du stagiaire connecté, triés par date puis heure de début croissantes.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des rendez-vous du stagiaire',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    appointments: [
                      { id: 3, intern_id: 5, supervisor_id: 3, title: 'Point hebdomadaire de suivi', appointment_date: '2026-06-10', start_time: '09:00', end_time: '09:30', meeting_type: 'VISIO', status: 'PENDING', created_by: 'INTERN' }
                    ]
                  }
                }
              }
            },
            403: { description: 'Accès réservé aux stagiaires' }
          }
        }
      },
      '/appointments/supervisor': {
        get: {
          tags: ['Appointments'],
          summary: 'Mes rendez-vous (encadrant)',
          description: "Protégé par protect. Accès réservé aux encadrants (403 si req.supervisorInfo est absent). Retourne tous les rendez-vous de l'encadrant connecté, triés par date puis heure de début croissantes.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des rendez-vous de l\'encadrant',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    appointments: [
                      { id: 3, intern_id: 5, supervisor_id: 3, title: 'Point hebdomadaire de suivi', appointment_date: '2026-06-10', start_time: '09:00', end_time: '09:30', meeting_type: 'VISIO', status: 'PENDING', created_by: 'INTERN' }
                    ]
                  }
                }
              }
            },
            403: { description: 'Accès réservé aux superviseurs' }
          }
        }
      },
      '/appointments/{appointmentId}': {
        get: {
          tags: ['Appointments'],
          summary: "Détails d'un rendez-vous",
          description: "Protégé par protect. Accessible uniquement aux deux participants du rendez-vous (le stagiaire concerné ou l'encadrant concerné). Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'appointmentId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Appointment ID' }
          ],
          responses: {
            200: {
              description: 'Rendez-vous récupéré',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    appointment: {
                      id: 3, intern_id: 5, supervisor_id: 3, title: 'Point hebdomadaire de suivi',
                      appointment_date: '2026-06-10', start_time: '09:00', end_time: '09:30',
                      meeting_type: 'VISIO', meeting_link: 'https://meet.google.com/abc-defg-hij',
                      status: 'PENDING', created_by: 'INTERN'
                    }
                  }
                }
              }
            },
            403: { description: "L'utilisateur connecté ne participe pas à ce rendez-vous" },
            404: { description: 'Rendez-vous introuvable' }
          }
        }
      },
      '/appointments/{appointmentId}/respond': {
        patch: {
          tags: ['Appointments'],
          summary: 'Accepter ou refuser un rendez-vous',
          description:
            "Protégé par protect. Le rendez-vous doit être au statut PENDING (sinon 400). " +
            "Seul le DESTINATAIRE de la demande peut répondre (voir CancelAppointment / RespondToAppointment description) : " +
            "si créé par un stagiaire → seul son encadrant peut répondre ; si créé par un encadrant → seul le stagiaire visé peut répondre. Sinon 403.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'appointmentId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Appointment ID' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RespondToAppointment' }
              }
            }
          },
          responses: {
            200: {
              description: 'Réponse enregistrée (exemple : acceptation)',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Rendez-vous accepté.',
                    appointment: { id: 3, status: 'ACCEPTED', updated_at: '2026-06-05T09:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: "action invalide (doit être ACCEPT ou REJECT), ou le rendez-vous n'est plus PENDING" },
            403: { description: "L'utilisateur connecté n'est pas le destinataire de cette demande" },
            404: { description: 'Rendez-vous introuvable' }
          }
        }
      },
      '/appointments/{appointmentId}/cancel': {
        patch: {
          tags: ['Appointments'],
          summary: 'Annuler un rendez-vous',
          description:
            "Protégé par protect. Accessible aux deux participants (stagiaire et encadrant du rendez-vous), quel que soit le créateur. " +
            "Impossible d'annuler un rendez-vous déjà CANCELLED ou COMPLETED (400). Le body est optionnel (reason).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'appointmentId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Appointment ID' }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CancelAppointment' }
              }
            }
          },
          responses: {
            200: {
              description: 'Rendez-vous annulé',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Rendez-vous annulé.',
                    appointment: { id: 3, status: 'CANCELLED', cancellation_reason: "Conflit d'agenda de dernière minute.", updated_at: '2026-06-05T10:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: 'Le rendez-vous est déjà CANCELLED ou COMPLETED' },
            403: { description: "L'utilisateur connecté ne participe pas à ce rendez-vous" },
            404: { description: 'Rendez-vous introuvable' }
          }
        }
      },
      '/appointments/{appointmentId}/complete': {
        patch: {
          tags: ['Appointments'],
          summary: 'Marquer un rendez-vous comme terminé',
          description:
            "Protégé par protect. Accessible aux deux participants (stagiaire et encadrant). Le rendez-vous doit être au statut ACCEPTED, sinon 400. Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'appointmentId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Appointment ID' }
          ],
          responses: {
            200: {
              description: 'Rendez-vous marqué comme terminé',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Rendez-vous marqué comme terminé.',
                    appointment: { id: 3, status: 'COMPLETED', updated_at: '2026-06-10T10:00:00.000Z' }
                  }
                }
              }
            },
            400: { description: "Seul un rendez-vous ACCEPTED peut être marqué comme terminé" },
            403: { description: "L'utilisateur connecté ne participe pas à ce rendez-vous" },
            404: { description: 'Rendez-vous introuvable' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // NOTIFICATIONS
      // Toutes les routes nécessitent : protect uniquement.
      // Aucune route n'attend de body — le destinataire est
      // toujours req.user.id (déduit du token), jamais du body.
      // ══════════════════════════════════════════════
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'Mes notifications',
          description: "Protégé par protect. Retourne TOUTES les notifications (lues et non lues) de l'utilisateur connecté, triées par created_at décroissant. Aucun paramètre, aucun body attendu.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des notifications',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    notifications: [
                      { id: 21, user_id: 12, title: 'Nouvelle tâche assignée', message: 'Amine Boudiaf vous a assigné la tâche "Intégrer le module de paiement".', type: 'TASK', is_read: false, created_at: '2026-06-05T08:00:00.000Z' },
                      { id: 18, user_id: 12, title: 'Document évalué', message: 'Votre document "Rapport de stage - Semaine 1" a été approuvé.', type: 'DOCUMENT', is_read: true, created_at: '2026-06-03T15:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' }
          }
        }
      },
      '/notifications/unread': {
        get: {
          tags: ['Notifications'],
          summary: 'Mes notifications non lues',
          description: "Protégé par protect. Retourne uniquement les notifications où is_read = FALSE pour l'utilisateur connecté, triées par created_at décroissant. Aucun paramètre, aucun body attendu.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des notifications non lues',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    notifications: [
                      { id: 21, user_id: 12, title: 'Nouvelle tâche assignée', message: 'Amine Boudiaf vous a assigné la tâche "Intégrer le module de paiement".', type: 'TASK', is_read: false, created_at: '2026-06-05T08:00:00.000Z' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' }
          }
        }
      },
      '/notifications/unread/count': {
        get: {
          tags: ['Notifications'],
          summary: 'Compter mes notifications non lues',
          description: "Protégé par protect. Retourne uniquement un compteur entier (COUNT SQL converti en Number), pratique pour un badge de notification. Aucun paramètre, aucun body attendu.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Nombre de notifications non lues',
              content: {
                'application/json': {
                  example: { success: true, count: 3 }
                }
              }
            },
            401: { description: 'Non authentifié' }
          }
        }
      },
      '/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Marquer toutes mes notifications comme lues',
          description:
            "Protégé par protect. Aucun body attendu. Passe is_read à TRUE pour toutes les notifications de l'utilisateur connecté dont is_read était FALSE, et renvoie la liste des notifications ainsi mises à jour (celles déjà lues avant l'appel ne sont pas incluses dans le tableau retourné).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Notifications marquées comme lues',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Toutes les notifications ont été marquées comme lues.',
                    notifications: [
                      { id: 21, user_id: 12, title: 'Nouvelle tâche assignée', is_read: true }
                    ]
                  }
                }
              }
            },
            401: { description: 'Non authentifié' }
          }
        }
      },
      '/notifications/{notificationId}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Marquer une notification comme lue',
          description:
            "Protégé par protect. Aucun body attendu. La mise à jour est scopée à user_id = utilisateur connecté (WHERE id = ... AND user_id = ...) : impossible de marquer comme lue la notification d'un autre utilisateur — dans ce cas la requête ne trouve aucune ligne et renvoie 404, exactement comme si la notification n'existait pas.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'notificationId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Notification ID' }
          ],
          responses: {
            200: {
              description: 'Notification marquée comme lue',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Notification marquée comme lue.',
                    notification: { id: 21, user_id: 12, title: 'Nouvelle tâche assignée', is_read: true }
                  }
                }
              }
            },
            404: { description: "Notification introuvable, ou n'appartient pas à l'utilisateur connecté" }
          }
        }
      },
      '/notifications/{notificationId}': {
        delete: {
          tags: ['Notifications'],
          summary: 'Supprimer une notification',
          description:
            "Protégé par protect. Aucun body attendu. La suppression est scopée à user_id = utilisateur connecté (WHERE id = ... AND user_id = ...) : impossible de supprimer la notification d'un autre utilisateur (404 dans ce cas, comme si elle n'existait pas).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'notificationId', in: 'path', required: true, schema: { type: 'integer' }, description: 'Notification ID' }
          ],
          responses: {
            200: {
              description: 'Notification supprimée',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Notification supprimée.',
                    notification: { id: 21, user_id: 12, title: 'Nouvelle tâche assignée', message: 'Amine Boudiaf vous a assigné la tâche "Intégrer le module de paiement".', type: 'TASK', is_read: false, created_at: '2026-06-05T08:00:00.000Z' }
                  }
                }
              }
            },
            404: { description: "Notification introuvable, ou n'appartient pas à l'utilisateur connecté" }
          }
        }
      },

      // ══════════════════════════════════════════════
      // STATISTIQUES
      // Toutes les routes nécessitent : protect uniquement.
      // AUCUNE route n'attend de body (GET uniquement, aucun
      // paramètre query ni path) — le rôle et le périmètre
      // (entreprise / encadrant / stagiaire) sont déduits
      // exclusivement du token via req.adminInfo / req.supervisorInfo
      // / req.internInfo.
      // ══════════════════════════════════════════════
      '/statistics/adminsup': {
        get: {
          tags: ['Statistiques'],
          summary: 'Statistiques globales de la plateforme (vue Super Admin)',
          description:
            "Protégé par protect uniquement. ⚠️ ATTENTION : contrairement aux 3 autres routes de ce groupe, le contrôleur ne vérifie AUCUN rôle particulier (pas de restrictTo, et aucune vérification de req.adminInfo/req.supervisorInfo/req.internInfo dans le code) : tout utilisateur possédant un access token valide peut donc appeler cette route, quel que soit son rôle réel. Aucun paramètre, aucun body attendu. " +
            "Agrège en parallèle (Promise.all) : compteurs globaux, entreprises par statut, stagiaires par type et par statut, tâches par statut et par priorité, rendez-vous par statut, documents par statut et par type, croissance de la plateforme (par mois) et activité de la plateforme (par jour).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Statistiques globales récupérées',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    statistics: {
                      globalCounts: {
                        total_companies: '12', approved_companies: '9', pending_companies: '2', rejected_companies: '1',
                        total_interns: '48', total_supervisors: '15', total_pfe: '30', total_pfc: '18',
                        total_tasks: '210', total_documents: '95', total_appointments: '37'
                      },
                      companiesByStatus: [
                        { status: 'APPROVED', count: '9' }, { status: 'pending', count: '2' }, { status: 'rejected', count: '1' }
                      ],
                      internsByType: [
                        { type: 'intern_PFE', count: '30' }, { type: 'intern_PFC', count: '18' }
                      ],
                      internsByStatus: [
                        { status: 'active', count: '40' }, { status: 'waiting', count: '8' }
                      ],
                      tasksByStatus: [
                        { status: 'in progress', count: '120' }, { status: 'done', count: '90' }
                      ],
                      tasksByPriority: [
                        { priority: 'high', count: '80' }, { priority: 'medium', count: '90' }, { priority: 'low', count: '40' }
                      ],
                      appointmentsByStatus: [
                        { status: 'ACCEPTED', count: '20' }, { status: 'PENDING', count: '10' }, { status: 'COMPLETED', count: '7' }
                      ],
                      documentsByStatus: [
                        { status: 'APPROVED', count: '60' }, { status: 'PENDING', count: '25' }, { status: 'REVISION_REQUIRED', count: '10' }
                      ],
                      documentsByType: [
                        { type: 'rapport_hebdomadaire', count: '70' }, { type: 'rapport_final', count: '25' }
                      ],
                      platformGrowth: [
                        { month: '2026-04-01T00:00:00.000Z', companies: '2', interns: '10', supervisors: '3' },
                        { month: '2026-05-01T00:00:00.000Z', companies: '3', interns: '15', supervisors: '5' }
                      ],
                      platformActivity: [
                        { activity_date: '2026-06-01', tasks: '5', documents: '2', appointments: '1' },
                        { activity_date: '2026-06-02', tasks: '3', documents: '4', appointments: '0' }
                      ]
                    }
                  }
                }
              }
            },
            401: { description: 'Non authentifié (token manquant ou invalide)' }
          }
        }
      },
      '/statistics/admin-secondary': {
        get: {
          tags: ['Statistiques'],
          summary: "Statistiques de l'entreprise (vue Admin Secondaire)",
          description:
            "Protégé par protect uniquement (pas de restrictTo, mais le contrôleur vérifie explicitement req.adminInfo?.company_id ; 403 si absent). Toutes les statistiques sont scopées à l'entreprise de l'admin secondaire connecté (company_id). Aucun paramètre, aucun body attendu. " +
            "Agrège en parallèle : compteurs de l'entreprise (stagiaires, encadrants, tâches, documents, rendez-vous), stagiaires par statut et par type, tâches par statut et par priorité, documents par statut, rendez-vous par statut, charge de travail par encadrant (nombre de stagiaires assignés), et croissance des stages par mois.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Statistiques de l'entreprise récupérées",
              content: {
                'application/json': {
                  example: {
                    success: true,
                    statistics: {
                      companyCounts: {
                        total_interns: '14', waiting_interns: '2', assigned_interns: '11',
                        total_supervisors: '4', total_pfe: '9', total_pfc: '5',
                        total_tasks: '52', total_documents: '30', total_appointments: '12'
                      },
                      internsByStatus: [
                        { status: 'active', count: '11' }, { status: 'waiting', count: '2' }
                      ],
                      internsByType: [
                        { type: 'intern_PFE', count: '9' }, { type: 'intern_PFC', count: '5' }
                      ],
                      tasksByStatus: [
                        { status: 'in progress', count: '30' }, { status: 'done', count: '22' }
                      ],
                      tasksByPriority: [
                        { priority: 'high', count: '20' }, { priority: 'medium', count: '22' }, { priority: 'low', count: '10' }
                      ],
                      documentsByStatus: [
                        { status: 'APPROVED', count: '18' }, { status: 'PENDING', count: '12' }
                      ],
                      appointmentsByStatus: [
                        { status: 'ACCEPTED', count: '7' }, { status: 'PENDING', count: '5' }
                      ],
                      supervisorWorkload: [
                        { supervisor_id: 3, supervisor_name: 'Amine Boudiaf', intern_count: '5' },
                        { supervisor_id: 7, supervisor_name: 'Sofiane Khaldi', intern_count: '4' }
                      ],
                      internshipGrowth: [
                        { month: '2026-05-01T00:00:00.000Z', interns: '4' },
                        { month: '2026-06-01T00:00:00.000Z', interns: '7' }
                      ]
                    }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer votre entreprise (req.adminInfo.company_id absent) — token d'un rôle autre qu'admin secondaire, ou profil admin secondaire incomplet" }
          }
        }
      },
      '/statistics/supervisor': {
        get: {
          tags: ['Statistiques'],
          summary: "Statistiques de l'encadrant connecté",
          description:
            "Protégé par protect uniquement (le contrôleur vérifie explicitement req.supervisorInfo?.id ; 403 si absent). Toutes les statistiques sont scopées à l'encadrant connecté. Aucun paramètre, aucun body attendu. " +
            "Agrège en parallèle : compteurs de l'encadrant (stagiaires, tâches, activités, documents, rendez-vous), stagiaires par statut et par type, tâches par statut et par priorité, documents par statut, rendez-vous par statut, et activités par mois.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Statistiques de l'encadrant récupérées",
              content: {
                'application/json': {
                  example: {
                    success: true,
                    statistics: {
                      supervisorCounts: {
                        total_interns: '5', active_interns: '4', total_tasks: '18',
                        total_activities: '6', total_documents: '10', total_appointments: '3'
                      },
                      internsByStatus: [
                        { status: 'supervisor_assigned', count: '4' }, { status: 'waiting', count: '1' }
                      ],
                      internsByType: [
                        { type: 'intern_PFE', count: '3' }, { type: 'intern_PFC', count: '2' }
                      ],
                      tasksByStatus: [
                        { status: 'in progress', count: '10' }, { status: 'done', count: '8' }
                      ],
                      tasksByPriority: [
                        { priority: 'high', count: '6' }, { priority: 'medium', count: '8' }, { priority: 'low', count: '4' }
                      ],
                      documentsByStatus: [
                        { status: 'APPROVED', count: '6' }, { status: 'PENDING', count: '4' }
                      ],
                      appointmentsByStatus: [
                        { status: 'ACCEPTED', count: '2' }, { status: 'PENDING', count: '1' }
                      ],
                      activities: [
                        { month: '2026-05-01T00:00:00.000Z', activities: '3' },
                        { month: '2026-06-01T00:00:00.000Z', activities: '3' }
                      ]
                    }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer votre profil superviseur (req.supervisorInfo.id absent) — token d'un rôle autre qu'encadrant" }
          }
        }
      },
      '/statistics/intern': {
        get: {
          tags: ['Statistiques'],
          summary: 'Statistiques du stagiaire connecté',
          description:
            "Protégé par protect uniquement (le contrôleur vérifie explicitement req.internInfo?.id ; 403 si absent). Toutes les statistiques sont scopées au stagiaire connecté. Aucun paramètre, aucun body attendu. " +
            "Agrège en parallèle : compteurs du stagiaire (tâches totales/terminées, documents, rendez-vous), tâches par statut et par priorité, documents par statut et par type, rendez-vous par statut, et progression du stage (dates de début/fin, statut, type de stage).",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Statistiques du stagiaire récupérées',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    statistics: {
                      internCounts: {
                        total_tasks: '9', completed_tasks: '5', total_documents: '4', total_appointments: '2'
                      },
                      tasksByStatus: [
                        { status: 'done', count: '5' }, { status: 'in progress', count: '4' }
                      ],
                      tasksByPriority: [
                        { priority: 'high', count: '3' }, { priority: 'medium', count: '4' }, { priority: 'low', count: '2' }
                      ],
                      documentsByStatus: [
                        { status: 'APPROVED', count: '3' }, { status: 'PENDING', count: '1' }
                      ],
                      documentsByType: [
                        { type: 'rapport_hebdomadaire', count: '3' }, { type: 'rapport_final', count: '1' }
                      ],
                      appointmentsByStatus: [
                        { status: 'ACCEPTED', count: '1' }, { status: 'PENDING', count: '1' }
                      ],
                      progress: {
                        start_date: '2026-06-01', end_date: '2026-09-01', status: 'active', intern_type: 'intern_PFE'
                      }
                    }
                  }
                }
              }
            },
            403: { description: "Impossible de déterminer votre profil stagiaire (req.internInfo.id absent) — token d'un rôle autre que stagiaire" }
          }
        }
      },

      // ══════════════════════════════════════════════
      // AI — ASSISTANT RAG, RÉSUMÉS, COMPARAISON DE PROJETS
      // Toutes les routes nécessitent : protect uniquement.
      // Accès réservé aux STAGIAIRES et ENCADRANTS : le
      // companyId est dérivé de req.internInfo?.company_id
      // OU req.supervisorInfo?.company_id. Tout autre rôle
      // (admin secondaire, super admin) reçoit un 403, faute
      // de company_id détecté par ce contrôleur.
      // ══════════════════════════════════════════════
      '/ai/ask': {
        post: {
          tags: ['AI'],
          summary: "Poser une question à l'assistant IA (RAG)",
          description:
            "Protégé par protect uniquement. Réservé aux stagiaires et encadrants (403 si companyId indéterminé). " +
            "Le RAG (Retrieval-Augmented Generation) interroge la base documentaire de l'entreprise de l'utilisateur connecté, en tenant compte de l'historique des 10 derniers messages de la conversation (s'il y en a une). " +
            "Chaque appel enregistre à la fois le message utilisateur et la réponse de l'IA dans la conversation, puis met à jour son timestamp.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AskAI' }
              }
            }
          },
          responses: {
            200: {
              description: 'Réponse générée',
              content: {
                'application/json': {
                  example: {
                    conversation: { id: 14, title: "Quel est le statut d'avancement du projet de gestion des..." },
                    answer: "D'après les documents disponibles, le module d'authentification est terminé et le module de paiement est en cours d'intégration (tâche assignée à Katia Benali, échéance 15 juin 2026).",
                    sources: [
                      { document_id: 9, title: 'Rapport de stage - Semaine 1', excerpt: '...' }
                    ]
                  }
                }
              }
            },
            400: { description: 'La question est manquante ou vide' },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: "Impossible de déterminer votre entreprise (ni stagiaire ni encadrant), ou la conversation indiquée n'appartient pas à l'utilisateur connecté" },
            404: { description: 'conversationId fourni mais introuvable' }
          }
        }
      },
      '/ai/documents/{id}/summary': {
        post: {
          tags: ['AI'],
          summary: "Générer le résumé IA d'un document",
          description:
            "Protégé par protect uniquement. Réservé aux stagiaires et encadrants (403 si companyId indéterminé). Aucun body attendu — l'ID du document est passé en paramètre d'URL. " +
            "Le document doit appartenir à la même entreprise que l'utilisateur connecté (vérifié dans le service summarizeDocument).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID' }
          ],
          responses: {
            200: {
              description: 'Résumé généré',
              content: {
                'application/json': {
                  example: {
                    documentId: 9,
                    title: 'Rapport de stage - Semaine 1',
                    summary: "Ce document présente les tâches réalisées durant la première semaine de stage, avec un focus sur l'intégration du module de paiement Stripe.",
                    keyPoints: [
                      'Mise en place du checkout Stripe',
                      'Tests unitaires du module de paiement',
                      'Bug mineur identifié sur mobile'
                    ]
                  }
                }
              }
            },
            400: { description: "L'identifiant du document est manquant" },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: 'Impossible de déterminer votre entreprise (ni stagiaire ni encadrant)' },
            404: { description: "Document introuvable ou n'appartenant pas à l'entreprise de l'utilisateur (selon l'implémentation du service)" }
          }
        }
      },
      '/ai/documents/{id}/similar': {
        get: {
          tags: ['AI'],
          summary: 'Trouver des projets/documents similaires',
          description:
            "Protégé par protect uniquement. Réservé aux stagiaires et encadrants (403 si companyId indéterminé). Aucun body attendu — l'ID du document est passé en paramètre d'URL. " +
            "Retourne jusqu'à 5 documents similaires (limite codée en dur côté serveur) au sein de la même entreprise.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Document ID de référence' }
          ],
          responses: {
            200: {
              description: 'Documents similaires trouvés',
              content: {
                'application/json': {
                  example: {
                    documentId: 9,
                    similarProjects: [
                      { document_id: 22, title: 'Rapport de stage - Intégration paiement V2', similarity_score: 0.87 },
                      { document_id: 31, title: 'Étude de faisabilité module Stripe', similarity_score: 0.79 }
                    ]
                  }
                }
              }
            },
            400: { description: "L'identifiant du document est manquant" },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: 'Impossible de déterminer votre entreprise (ni stagiaire ni encadrant)' }
          }
        }
      },
      '/ai/documents/compare': {
        post: {
          tags: ['AI'],
          summary: 'Comparer deux documents/projets via IA',
          description:
            "Protégé par protect uniquement. Réservé aux stagiaires et encadrants (403 si companyId indéterminé). " +
            "documentId1 et documentId2 sont convertis en Number avant l'appel au service ; ils doivent être différents (400 sinon) et appartenir à l'entreprise de l'utilisateur connecté.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CompareProjects' }
              }
            }
          },
          responses: {
            200: {
              description: 'Comparaison générée',
              content: {
                'application/json': {
                  example: {
                    document1: { id: 9, title: 'Rapport de stage - Semaine 1' },
                    document2: { id: 12, title: 'Rapport de stage - Semaine 2' },
                    comparison: "Les deux documents couvrent le même projet de module de paiement, mais le second inclut des tests d'intégration supplémentaires et corrige le bug de pagination mobile mentionné dans le premier.",
                    similarities: ['Même module (paiement Stripe)', 'Même stagiaire'],
                    differences: ['Le second document ajoute des tests E2E', 'Statut différent : PENDING vs APPROVED']
                  }
                }
              }
            },
            400: { description: 'documentId1 ou documentId2 manquant, ou les deux identifiants sont identiques' },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: 'Impossible de déterminer votre entreprise (ni stagiaire ni encadrant)' }
          }
        }
      },

      // ══════════════════════════════════════════════
      // AI — CONVERSATIONS
      // ══════════════════════════════════════════════
      '/ai/conversations': {
        get: {
          tags: ['AI'],
          summary: 'Liste de mes conversations IA',
          description: "Protégé par protect uniquement (accessible à tout utilisateur authentifié, pas seulement stagiaire/encadrant — aucune vérification de companyId ici). Aucun body attendu. Retourne toutes les conversations de l'utilisateur connecté.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Liste des conversations',
              content: {
                'application/json': {
                  example: {
                    conversations: [
                      { id: 14, user_id: 12, title: "Quel est le statut d'avancement du projet de gestion des...", created_at: '2026-06-05T08:00:00.000Z', updated_at: '2026-06-05T08:05:00.000Z' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Utilisateur non authentifié' }
          }
        }
      },
      '/ai/conversations/{id}': {
        get: {
          tags: ['AI'],
          summary: 'Détails d\'une conversation + ses messages',
          description: "Protégé par protect uniquement. La conversation doit appartenir à l'utilisateur connecté (403 sinon). Aucun body attendu.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Conversation ID' }
          ],
          responses: {
            200: {
              description: 'Conversation et messages récupérés',
              content: {
                'application/json': {
                  example: {
                    conversation: { id: 14, title: "Quel est le statut d'avancement du projet de gestion des...", created_at: '2026-06-05T08:00:00.000Z', updated_at: '2026-06-05T08:05:00.000Z' },
                    messages: [
                      { id: 1, conversation_id: 14, role: 'user', content: "Quel est le statut d'avancement du projet de gestion des stages ?", created_at: '2026-06-05T08:00:00.000Z' },
                      { id: 2, conversation_id: 14, role: 'assistant', content: "D'après les documents disponibles, le module d'authentification est terminé...", created_at: '2026-06-05T08:00:05.000Z' }
                    ]
                  }
                }
              }
            },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: "Cette conversation n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Conversation introuvable' }
          }
        },
        delete: {
          tags: ['AI'],
          summary: 'Supprimer une conversation IA',
          description: "Protégé par protect uniquement. La conversation doit appartenir à l'utilisateur connecté (403 sinon). Aucun body attendu. Supprime également, selon le modèle, les messages associés (à vérifier au niveau de la contrainte FK / du modèle AIConversation.delete).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, description: 'Conversation ID' }
          ],
          responses: {
            200: {
              description: 'Conversation supprimée',
              content: {
                'application/json': {
                  example: { message: 'Conversation supprimée avec succès.' }
                }
              }
            },
            401: { description: 'Utilisateur non authentifié' },
            403: { description: "Cette conversation n'appartient pas à l'utilisateur connecté" },
            404: { description: 'Conversation introuvable' }
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
