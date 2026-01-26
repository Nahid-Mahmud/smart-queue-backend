import bcryptjs from "bcryptjs";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createNewRefreshToken } from "../../utils/userTokens";
import User from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import envVariables from "../../config/env";
import { passwordZodValidationSchema } from "../user/user.validation";
import jwt from "jsonwebtoken";
import { IsActive } from "../user/user.interface";

const credentialLogin = async (req: Request, res: Response, next: NextFunction) => {
  return new Promise((resolve, reject) => {
    passport.authenticate("local", async (error: any, user: any, info: any) => {
      if (error) {
        return reject(new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
      }

      if (!user) {
        return reject(new AppError(StatusCodes.UNAUTHORIZED, info.message || "Invalid credentials"));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user.toObject();
      resolve(userWithoutPassword);
    })(req, res, next);
  });
};

const generateAccessTokenFromRefreshToken = async (refreshToken: string) => {
  const newAccessToken = await createNewRefreshToken(refreshToken);
  return newAccessToken;
};

const resetPassword = async (newPassword: string, id: string, decodedToken: JwtPayload) => {
  if (decodedToken.userId !== id) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to perform this action");
  }

  const isUserExist = await User.findById(decodedToken.userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const hashedNewPassword = await bcryptjs.hash(newPassword, Number(envVariables.BCRYPT_SALT_ROUNDS));

  isUserExist.password = hashedNewPassword;
  await isUserExist.save();
};

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
  if (!decodedToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized to perform this action");
  }

  // validate old password and new password
  if (oldPassword === newPassword) {
    throw new AppError(StatusCodes.BAD_REQUEST, "New password must be different from old password");
  }

  // validate new password
  const zodPasswordValidationResult = await passwordZodValidationSchema.parseAsync(newPassword);

  // get user from database
  const userFromDb = await User.findById(decodedToken.userId);

  // check if user exists
  if (!userFromDb) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  // check if old password is correct
  const isPasswordMatch = await bcryptjs.compare(oldPassword, userFromDb.password as string);

  // if old password is incorrect, throw error
  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Old password is incorrect");
  }

  // old password and new password should not be the same

  const hashedNewPassword = await bcryptjs.hash(zodPasswordValidationResult, Number(envVariables.BCRYPT_SALT_ROUNDS));

  // update user password
  await User.findByIdAndUpdate(userFromDb._id, { password: hashedNewPassword }, { new: true, runValidators: true });
};

const forgotPassword = async (email: string) => {
  //

  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User does not exist");
  }
  if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
    throw new AppError(StatusCodes.BAD_REQUEST, `User is ${isUserExist.isActive}`);
  }
  if (isUserExist.isDeleted) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is deleted");
  }

  if (!isUserExist.isVerified) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User is not verified");
  }

  const JwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetToken = jwt.sign(JwtPayload, envVariables.ACCESS_TOKEN_JWT_SECRET, {
    expiresIn: "10m",
  });
};

export const authService = {
  credentialLogin,
  generateAccessTokenFromRefreshToken,
  resetPassword,
  changePassword,
  forgotPassword,
};
