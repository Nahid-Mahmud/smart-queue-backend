import { model, Schema } from "mongoose";
import { IsActive, IUser, UserRole } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isActive: { type: String, enum: Object.values(IsActive), default: IsActive.ACTIVE },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<IUser>("User", userSchema);
export default User;
