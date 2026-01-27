import dotenv from "dotenv";

dotenv.config();

interface EnvVariables {
  PORT: string;
  MONGO_URI: string;
  NODE_ENV: "development" | "production" | "test";
  BCRYPT_SALT_ROUNDS: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  ACCESS_TOKEN_JWT_SECRET: string;
  ACCESS_TOKEN_JWT_EXPIRATION: string;
  REFRESH_TOKEN_JWT_SECRET: string;
  REFRESH_TOKEN_JWT_EXPIRATION: string;
  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;
  TEST_MONGO_URI?: string;
}

const loadEnvVariable = (): EnvVariables => {
  const requiredEnvVariables = [
    "PORT",
    "MONGO_URI",
    "NODE_ENV",
    "BCRYPT_SALT_ROUNDS",
    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",
    "ACCESS_TOKEN_JWT_SECRET",
    "ACCESS_TOKEN_JWT_EXPIRATION",
    "REFRESH_TOKEN_JWT_SECRET",
    "REFRESH_TOKEN_JWT_EXPIRATION",
    "EXPRESS_SESSION_SECRET",
    "FRONTEND_URL",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  let mongoUri = process.env.MONGO_URI as string;

  if (process.env.NODE_ENV === "test") {
    if (!process.env.TEST_MONGO_URI) {
      throw new Error("Missing required environment variable: TEST_MONGO_URI");
    }
    mongoUri = process.env.TEST_MONGO_URI as string;
  }

  return {
    PORT: process.env.PORT as string,
    MONGO_URI: mongoUri,
    NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
    ACCESS_TOKEN_JWT_SECRET: process.env.ACCESS_TOKEN_JWT_SECRET as string,
    ACCESS_TOKEN_JWT_EXPIRATION: process.env.ACCESS_TOKEN_JWT_EXPIRATION as string,
    REFRESH_TOKEN_JWT_SECRET: process.env.REFRESH_TOKEN_JWT_SECRET as string,
    REFRESH_TOKEN_JWT_EXPIRATION: process.env.REFRESH_TOKEN_JWT_EXPIRATION as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

const envVariables = loadEnvVariable();
export default envVariables;
