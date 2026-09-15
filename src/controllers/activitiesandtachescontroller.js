import Taches from "../models/tachesmodel.js";
import Activities from "../models/activitiesmodel.js";
import Intern from "../models/internmodel.js";

// =====================================================
// SUPERVISOR - GET TACHES
// =====================================================

export const getSupervisorsTaches = async (req, res) => {

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }

  const taches = await Taches.findBySupervisorId(supervisorId);

  return res.status(200).json({
    success: true,
    count: taches.length,
    taches
  });
};


// =====================================================
// SUPERVISOR - GET ACTIVITIES
// =====================================================

export const getSupervisorsActivities = async (req, res) => {

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }
console.log("*******/*****/****",supervisorId)
  const activities =
    await Activities.findBySupervisorId(supervisorId);
console.log("*******/*****/****",activities)
  return res.status(200).json({
    success: true,
    count: activities.length,
    activities
  });
};


// =====================================================
// INTERN - GET TACHES
// =====================================================

export const getInternsTaches = async (req, res) => {

  const companyId = req.internInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Vous n'êtes pas stagiaire !"
    );
    error.statusCode = 403;
    throw error;
  }

  const taches = await Taches.findByInternId(internId);

  return res.status(200).json({
    success: true,
    count: taches.length,
    taches
  });
};


// =====================================================
// INTERN - GET ACTIVITIES
// =====================================================

export const getInternsActivities = async (req, res) => {

  const companyId = req.internInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Vous n'êtes pas stagiaire !"
    );
    error.statusCode = 403;
    throw error;
  }

  const internName = await Intern.findNameById(internId);
console.log("*********>:",internName.name)
  const activities =
    await Activities.getInternsActivities(internName.name);

  return res.status(200).json({
    success: true,
    count: activities.length,
    activities
  });
};


// =====================================================
// SUPERVISOR - CREATE TACHE
// =====================================================

export const createTachebysup = async (req, res) => {

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    intern_name,
    title,
    description,
    priority,
    end_date
  } = req.body;

  const intern = await Intern.findByName(intern_name);
console.log("intern_name",intern_name)
  console.log("intern",intern);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const internID = intern.id;

  const tache = await Taches.create({
    company_id: companyId,
    supervisor_id: supervisorId,
    intern_id: internID,
    title: title,
    description: description,
    priority: priority,
    end_date: end_date,
    status: "in progress"
  });

  return res.status(201).json({
    success: true,
    tache
  });
};


// =====================================================
// SUPERVISOR - UPDATE TACHE
// =====================================================

export const updateTachebysup = async (req, res) => {

  const { tacheId } = req.params;

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    intern_name,
    title,
    description,
    priority,
    end_date
  } = req.body;

  const tache = await Taches.findById(tacheId);

  if (!tache) {
    const error = new Error("Tâche introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const internID = intern_name
    ? (await Intern.findByName(intern_name))?.id
    : tache.intern_id;

  await Taches.update(tacheId, {
    company_id: companyId,
    supervisor_id: supervisorId,
    intern_id: internID,
    title: title ?? tache.title,
    description: description ?? tache.description,
    priority: priority ?? tache.priority,
    end_date: end_date ?? tache.end_date,
    status: tache.status
  });

  return res.status(200).json({
    success: true,
    message: "La tâche est modifiée avec succès !"
  });
};


// =====================================================
// SUPERVISOR - DELETE TACHE
// =====================================================

export const deleteTachebysup = async (req, res) => {

  const { tacheId } = req.params;

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }
const tache=await Taches.findById(tacheId);
if(!tache){
    const error = new Error(
      "La tache n'existe meme pas!" 
    );
    error.statusCode = 403;
    throw error;
  }
  await Taches.delete(tacheId);

  return res.status(200).json({
    success: true,
    message: "La tâche est supprimée avec succès !"
  });
};


// =====================================================
// INTERN - CREATE TACHE
// =====================================================

export const createTachebyIntern = async (req, res) => {

  const companyId = req.internInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Vous n'êtes pas stagiaire !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description,
    priority,
    end_date
  } = req.body;


  const intern = await Intern.findById(internId);

  if (!intern) {
    const error = new Error("Stagiaire introuvable.");
    error.statusCode = 404;
    throw error;
  }

  const supervisorId = intern.supervisor_id;

  if (!supervisorId) {
    const error = new Error(
      "Aucun encadrant n'est assigné à ce stagiaire."
    );
    error.statusCode = 400;
    throw error;
  }

  const tache = await Taches.create({
    company_id: companyId,
    supervisor_id: supervisorId,
    intern_id: internId,
    title: title,
    description: description,
    priority: priority,
    end_date: end_date,
    status: "in progress"
  });

  return res.status(201).json({
    success: true,
    tache
  });
};


// =====================================================
// INTERN - UPDATE TACHE
// =====================================================

export const updateTachebyIntern = async (req, res) => {

  const { tacheId } = req.params;

  const companyId = req.internInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Vous n'êtes pas stagiaire !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description,
    priority,
    end_date
  } = req.body;

  const tache = await Taches.findById(tacheId);

  if (!tache) {
    const error = new Error("Tâche introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await Taches.update(tacheId, {
    company_id: companyId,
    supervisor_id: tache.supervisor_id,
    intern_id: internId,
    title: title ?? tache.title,
    description: description ?? tache.description,
    priority: priority ?? tache.priority,
    end_date: end_date ?? tache.end_date,
    status: tache.status
  });

  return res.status(200).json({
    success: true,
    message: "La tâche est modifiée avec succès !"
  });
};


// =====================================================
// INTERN - DELETE TACHE
// =====================================================

export const deleteTachebyIntern = async (req, res) => {

  const { tacheId } = req.params;

  const companyId = req.internInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Vous n'êtes pas stagiaire !"
    );
    error.statusCode = 403;
    throw error;
  }
const tache=await Taches.findById(tacheId);
if(!tache){
    const error = new Error(
      "La tache n'existe meme pas!" 
    );
    error.statusCode = 403;
    throw error;
  }
  await Taches.delete(tacheId);

  return res.status(200).json({
    success: true,
    message: "La tâche est supprimée avec succès !"
  });
};


// =====================================================
// SUPERVISOR - CREATE ACTIVITY
// =====================================================

export const createActivity = async (req, res) => {

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description,
    interns,
    priority,
    end_date
  } = req.body;


  const activity = await Activities.create({
    company_id: companyId,
    supervisor_id: supervisorId,
    interns: interns,
    title: title,
    description: description,
    end_date: end_date
  });

  return res.status(201).json({
    success: true,
    activity
  });
};


// =====================================================
// SUPERVISOR - UPDATE ACTIVITY
// =====================================================

export const updateActivity = async (req, res) => {

  const { activityId } = req.params;

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }

  const {
    title,
    description,
    interns,
    end_date
  } = req.body;

  const activity = await Activities.findById(activityId);

  if (!activity) {
    const error = new Error("Activité introuvable.");
    error.statusCode = 404;
    throw error;
  }

  await Activities.update(activityId, {
    company_id: companyId,
    supervisor_id: supervisorId,
    interns: interns ?? activity.interns,
    title: title ?? activity.title,
    description: description ?? activity.description,
    end_date: end_date ?? activity.end_date
  });

  return res.status(200).json({
    success: true,
    message: "L'activité est modifiée avec succès !"
  });
};


// =====================================================
// SUPERVISOR - DELETE ACTIVITY
// =====================================================

export const deleteActivity = async (req, res) => {

  const { activityId } = req.params;

  const companyId = req.supervisorInfo?.company_id;

  if (!companyId) {
    const error = new Error(
      "Impossible de déterminer votre entreprise."
    );
    error.statusCode = 403;
    throw error;
  }

  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Vous n'êtes pas encadrant !"
    );
    error.statusCode = 403;
    throw error;
  }
const activity= await Activities.findById(activityId);
if(!activity){
    const error = new Error(
      "L'activité n'existe meme pas!" 
    );
    error.statusCode = 403;
    throw error;
  }  
await Activities.delete(activityId);

  return res.status(200).json({
    success: true,
    message: "L'activité est supprimée avec succès !"
  });
};