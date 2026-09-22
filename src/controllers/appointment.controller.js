import Appointment from "../models/appointmentmodel.js";
import Intern from "../models/internmodel.js";
// ======================================================
// CREATE APPOINTMENT
// ======================================================

export const createAppointment = async (req, res) => {

  const {
    title,
    description,
    appointment_date,
    start_time,
    end_time,
    meeting_type,
    location,
    meeting_link,
    intern_name,
  } = req.body;


  // ======================================================
  // VÉRIFICATIONS GÉNÉRALES
  // ======================================================

  if (
    !title ||
    !appointment_date ||
    !start_time ||
    !end_time ||
    !meeting_type
  ) {
    const error = new Error(
      "Les champs obligatoires sont manquants."
    );

    error.statusCode = 400;
    throw error;
  }


  if (!["PRESENTIEL", "VISIO"].includes(meeting_type)) {

    const error = new Error(
      "Le type de rendez-vous doit être PRESENTIEL ou VISIO."
    );

    error.statusCode = 400;
    throw error;
  }


  if (end_time <= start_time) {

    const error = new Error(
      "L'heure de fin doit être supérieure à l'heure de début."
    );

    error.statusCode = 400;
    throw error;
  }


  // ======================================================
  // VÉRIFICATION PRESENTIEL / VISIO
  // ======================================================

  if (meeting_type === "PRESENTIEL" && !location) {

    const error = new Error(
      "Le lieu est obligatoire pour un rendez-vous présentiel."
    );

    error.statusCode = 400;
    throw error;
  }


  if (meeting_type === "VISIO" && !meeting_link) {

    const error = new Error(
      "Le lien de visioconférence est obligatoire."
    );

    error.statusCode = 400;
    throw error;
  }


  // ======================================================
  // VARIABLES
  // ======================================================

  let internId;
  let supervisorId;
  let createdBy;


  // ======================================================
  // CAS 1 : INTERN CRÉE
  // ======================================================

  if (req.internInfo) {

    internId = req.internInfo.id;

    supervisorId = req.internInfo.supervisor_id;

    createdBy = "INTERN";


    if (!supervisorId) {

      const error = new Error(
        "Vous n'avez pas encore de superviseur assigné."
      );

      error.statusCode = 400;

      throw error;
    }
  }


  // ======================================================
  // CAS 2 : SUPERVISOR CRÉE
  // ======================================================

  else if (req.supervisorInfo) {

    supervisorId = req.supervisorInfo.id;

    createdBy = "SUPERVISOR";


    // Le superviseur doit sélectionner un stagiaire
    if (!intern_name) {

      const error = new Error(
        "Vous devez sélectionner un stagiaire."
      );

      error.statusCode = 400;

      throw error;
    }


    // Chercher le stagiaire par son nom
    const intern = await Intern.findByName(intern_name);

    console.log("intern:", intern);


    if (!intern) {

      const error = new Error(
        "Stagiaire introuvable."
      );

      error.statusCode = 404;

      throw error;
    }


    // Vérifier que le stagiaire appartient
    // bien à ce superviseur

    const assignedIntern =
      await Appointment.findInternForSupervisor(
        intern.id,
        supervisorId
      );


    if (!assignedIntern) {

      const error = new Error(
        "Ce stagiaire ne vous est pas assigné."
      );

      error.statusCode = 403;

      throw error;
    }


    internId = intern.id;
  }


  // ======================================================
  // AUCUN PROFIL RECONNU
  // ======================================================

  else {

    const error = new Error(
      "Vous devez être un stagiaire ou un superviseur."
    );

    error.statusCode = 403;

    throw error;
  }


  // ======================================================
  // CRÉATION
  // ======================================================

  const appointment = await Appointment.create({

    intern_id: internId,

    supervisor_id: supervisorId,

    title,

    description,

    appointment_date,

    start_time,

    end_time,

    meeting_type,

    location:
      meeting_type === "PRESENTIEL"
        ? location
        : null,

    meeting_link:
      meeting_type === "VISIO"
        ? meeting_link
        : null,

    created_by: createdBy,
  });


  return res.status(201).json({

    success: true,

    message: "Rendez-vous créé avec succès.",

    appointment,
  });
};
// ======================================================
// GET INTERN APPOINTMENTS
// ======================================================

export const getInternAppointments = async (req, res) => {
  if (!req.internInfo) {
    const error = new Error(
      "Accès réservé aux stagiaires."
    );
    error.statusCode = 403;
    throw error;
  }

  const appointments = await Appointment.findByIntern(
    req.internInfo.id
  );

  return res.status(200).json({
    success: true,
    appointments,
  });
};


// ======================================================
// GET SUPERVISOR APPOINTMENTS
// ======================================================

export const getSupervisorAppointments = async (req, res) => {
  if (!req.supervisorInfo) {
    const error = new Error(
      "Accès réservé aux superviseurs."
    );
    error.statusCode = 403;
    throw error;
  }

  const appointments = await Appointment.findBySupervisor(
    req.supervisorInfo.id
  );

  return res.status(200).json({
    success: true,
    appointments,
  });
};


// ======================================================
// GET APPOINTMENT BY ID
// ======================================================

export const getAppointmentById = async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(
    appointmentId
  );

  if (!appointment) {
    const error = new Error(
      "Rendez-vous introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------
  // Vérifier que l'utilisateur
  // participe au rendez-vous
  // ---------------------------------

  const isIntern =
    req.internInfo &&
    appointment.intern_id === req.internInfo.id;

  const isSupervisor =
    req.supervisorInfo &&
    appointment.supervisor_id === req.supervisorInfo.id;

  if (!isIntern && !isSupervisor) {
    const error = new Error(
      "Vous n'êtes pas autorisé à consulter ce rendez-vous."
    );
    error.statusCode = 403;
    throw error;
  }

  return res.status(200).json({
    success: true,
    appointment,
  });
};


// ======================================================
// RESPOND TO APPOINTMENT
// ACCEPT / REJECT
// ======================================================

export const respondToAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { action, reason } = req.body;

  // ---------------------------------
  // Vérifier l'action
  // ---------------------------------

  if (!["ACCEPT", "REJECT"].includes(action)) {
    const error = new Error(
      "Action invalide. Utilisez ACCEPT ou REJECT."
    );
    error.statusCode = 400;
    throw error;
  }

  // ---------------------------------
  // Récupérer le rendez-vous
  // ---------------------------------

  const appointment = await Appointment.findById(
    appointmentId
  );

  if (!appointment) {
    const error = new Error(
      "Rendez-vous introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------
  // Le rendez-vous doit être PENDING
  // ---------------------------------

  if (appointment.status !== "PENDING") {
    const error = new Error(
      "Ce rendez-vous ne peut plus recevoir de réponse."
    );
    error.statusCode = 400;
    throw error;
  }

  // ======================================================
  // QUI PEUT RÉPONDRE ?
  // ======================================================

  let canRespond = false;

  // Si l'intern a créé le rendez-vous,
  // seul le superviseur peut répondre.
  if (appointment.created_by === "INTERN") {
    if (
      req.supervisorInfo &&
      appointment.supervisor_id === req.supervisorInfo.id
    ) {
      canRespond = true;
    }
  }

  // Si le superviseur a créé le rendez-vous,
  // seul l'intern peut répondre.
  if (appointment.created_by === "SUPERVISOR") {
    if (
      req.internInfo &&
      appointment.intern_id === req.internInfo.id
    ) {
      canRespond = true;
    }
  }

  if (!canRespond) {
    const error = new Error(
      "Vous n'êtes pas autorisé à répondre à ce rendez-vous."
    );
    error.statusCode = 403;
    throw error;
  }

  // ======================================================
  // ACCEPT
  // ======================================================

  if (action === "ACCEPT") {
    const updatedAppointment =
      await Appointment.accept(appointmentId);

    return res.status(200).json({
      success: true,
      message: "Rendez-vous accepté.",
      appointment: updatedAppointment,
    });
  }

  // ======================================================
  // REJECT
  // ======================================================

  if (action === "REJECT") {
    const updatedAppointment =
      await Appointment.reject(
        appointmentId,
        reason
      );

    return res.status(200).json({
      success: true,
      message: "Rendez-vous refusé.",
      appointment: updatedAppointment,
    });
  }
};


// ======================================================
// CANCEL APPOINTMENT
// ======================================================

export const cancelAppointment = async (req, res) => {
  const { appointmentId } = req.params;
  const { reason } = req.body;

  const appointment = await Appointment.findById(
    appointmentId
  );

  if (!appointment) {
    const error = new Error(
      "Rendez-vous introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  // ---------------------------------
  // Vérifier participant
  // ---------------------------------

  const isIntern =
    req.internInfo &&
    appointment.intern_id === req.internInfo.id;

  const isSupervisor =
    req.supervisorInfo &&
    appointment.supervisor_id === req.supervisorInfo.id;

  if (!isIntern && !isSupervisor) {
    const error = new Error(
      "Vous n'êtes pas autorisé à annuler ce rendez-vous."
    );
    error.statusCode = 403;
    throw error;
  }

  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "COMPLETED"
  ) {
    const error = new Error(
      "Ce rendez-vous ne peut plus être annulé."
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedAppointment =
    await Appointment.cancel(
      appointmentId,
      reason
    );

  return res.status(200).json({
    success: true,
    message: "Rendez-vous annulé.",
    appointment: updatedAppointment,
  });
};


// ======================================================
// COMPLETE APPOINTMENT
// ======================================================

export const completeAppointment = async (req, res) => {
  const { appointmentId } = req.params;

  const appointment = await Appointment.findById(
    appointmentId
  );

  if (!appointment) {
    const error = new Error(
      "Rendez-vous introuvable."
    );
    error.statusCode = 404;
    throw error;
  }

  const isIntern =
    req.internInfo &&
    appointment.intern_id === req.internInfo.id;

  const isSupervisor =
    req.supervisorInfo &&
    appointment.supervisor_id === req.supervisorInfo.id;

  if (!isIntern && !isSupervisor) {
    const error = new Error(
      "Vous n'êtes pas autorisé à terminer ce rendez-vous."
    );
    error.statusCode = 403;
    throw error;
  }

  if (appointment.status !== "ACCEPTED") {
    const error = new Error(
      "Seul un rendez-vous accepté peut être terminé."
    );
    error.statusCode = 400;
    throw error;
  }

  const updatedAppointment =
    await Appointment.complete(
      appointmentId
    );

  return res.status(200).json({
    success: true,
    message: "Rendez-vous marqué comme terminé.",
    appointment: updatedAppointment,
  });
};