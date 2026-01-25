import ActivityLog from "./activityLog.model";

const getAllLogsFromDB = async () => {
  const result = await ActivityLog.find({ isDeleted: false }).sort("-createdAt").limit(10);
  return result;
};

export const ActivityLogService = {
  getAllLogsFromDB,
};
