import Statistics from "../models/statisticsmodel.js";

export const getAdminStatistics = async (req, res) => {

const [
globalCounts,
companiesByStatus,
internsByType,
internsByStatus,
tasksByStatus,
tasksByPriority,
appointmentsByStatus,
documentsByStatus,
documentsByType,
platformGrowth,
platformActivity
] = await Promise.all([

Statistics.getGlobalCounts(),

Statistics.getCompaniesByStatus(),

Statistics.getInternsByType(),

Statistics.getInternsByStatus(),

Statistics.getTasksByStatus(),

Statistics.getTasksByPriority(),

Statistics.getAppointmentsByStatus(),

Statistics.getDocumentsByStatus(),

Statistics.getDocumentsByType(),

Statistics.getPlatformGrowth(),

Statistics.getPlatformActivity()

]);

return res.status(200).json({
success: true,

statistics: {

  globalCounts,

  companiesByStatus,

  internsByType,

  internsByStatus,

  tasksByStatus,

  tasksByPriority,

  appointmentsByStatus,

  documentsByStatus,

  documentsByType,

  platformGrowth,

  platformActivity

}

});
};
export const getSecondaryAdminStatistics = async (req, res) => {

const companyId = req.adminInfo?.company_id;
console.log("companyId",companyId);
if (!companyId) {
const error = new Error(
"Impossible de déterminer votre entreprise."
);

error.statusCode = 403;

throw error;

}

const [
companyCounts,
internsByStatus,
internsByType,
tasksByStatus,
tasksByPriority,
documentsByStatus,
appointmentsByStatus,
supervisorWorkload,
internshipGrowth
] = await Promise.all([

Statistics.getCompanyCounts(companyId),

Statistics.getCompanyInternsByStatus(companyId),

Statistics.getCompanyInternsByType(companyId),

Statistics.getCompanyTasksByStatus(companyId),

Statistics.getCompanyTasksByPriority(companyId),

Statistics.getCompanyDocumentsByStatus(companyId),

Statistics.getCompanyAppointmentsByStatus(companyId),

Statistics.getSupervisorWorkload(companyId),

Statistics.getCompanyInternshipGrowth(companyId)

]);

return res.status(200).json({
success: true,

statistics: {
  companyCounts,
  internsByStatus,
  internsByType,
  tasksByStatus,
  tasksByPriority,
  documentsByStatus,
  appointmentsByStatus,
  supervisorWorkload,
  internshipGrowth
}

});
};
export const getSupervisorStatistics = async (req, res) => {
  const supervisorId = req.supervisorInfo?.id;

  if (!supervisorId) {
    const error = new Error(
      "Impossible de déterminer votre profil superviseur."
    );

    error.statusCode = 403;
    throw error;
  }

  const [
    supervisorCounts,
    internsByStatus,
    internsByType,
    tasksByStatus,
    tasksByPriority,
    documentsByStatus,
    appointmentsByStatus,
    activities
  ] = await Promise.all([
    Statistics.getSupervisorCounts(supervisorId),
    Statistics.getSupervisorInternsByStatus(supervisorId),
    Statistics.getSupervisorInternsByType(supervisorId),
    Statistics.getSupervisorTasksByStatus(supervisorId),
    Statistics.getSupervisorTasksByPriority(supervisorId),
    Statistics.getSupervisorDocumentsByStatus(supervisorId),
    Statistics.getSupervisorAppointmentsByStatus(supervisorId),
    Statistics.getSupervisorActivities(supervisorId)
  ]);

  return res.status(200).json({
    success: true,
    statistics: {
      supervisorCounts,
      internsByStatus,
      internsByType,
      tasksByStatus,
      tasksByPriority,
      documentsByStatus,
      appointmentsByStatus,
      activities
    }
  });
};
export const getInternStatistics = async (req, res) => {
  const internId = req.internInfo?.id;

  if (!internId) {
    const error = new Error(
      "Impossible de déterminer votre profil stagiaire."
    );

    error.statusCode = 403;
    throw error;
  }

  const [
    internCounts,
    tasksByStatus,
    tasksByPriority,
    documentsByStatus,
    documentsByType,
    appointmentsByStatus,
    progress
  ] = await Promise.all([
    Statistics.getInternCounts(internId),
    Statistics.getInternTasksByStatus(internId),
    Statistics.getInternTasksByPriority(internId),
    Statistics.getInternDocumentsByStatus(internId),
    Statistics.getInternDocumentsByType(internId),
    Statistics.getInternAppointmentsByStatus(internId),
    Statistics.getInternProgress(internId)
  ]);

  return res.status(200).json({
    success: true,
    statistics: {
      internCounts,
      tasksByStatus,
      tasksByPriority,
      documentsByStatus,
      documentsByType,
      appointmentsByStatus,
      progress
    }
  });
};