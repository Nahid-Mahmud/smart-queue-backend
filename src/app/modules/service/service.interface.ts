export interface IService {
  serviceName: string;
  duration: 15 | 30 | 60;
  requiredStaffType: string;
  isDeleted: boolean;
}
