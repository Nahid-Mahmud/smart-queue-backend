import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: `Invalid mongodb ${err.path}: ${err.value}. Please provide a valid id}.`,
  };
};
