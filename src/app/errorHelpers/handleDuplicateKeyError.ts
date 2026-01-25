/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateKeyError = (err: any): TGenericErrorResponse => {
  const matchedArray = err.message.match(/"([^"]*)"/);

  return {
    statusCode: 409,
    message: `${matchedArray[1]} already exists. Please provide a unique value.`,
  };
};
