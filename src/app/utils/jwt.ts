import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const generateJwtToken = (jwtPayload: JwtPayload, jwtSecret: string, jwtExpiration: string): string => {
  const token = jwt.sign(jwtPayload, jwtSecret, {
    expiresIn: jwtExpiration,
  } as SignOptions);

  return token;
};

export const verifyJwtToken = (jwtToken: string, jwtSecret: string): JwtPayload => {
  const decodedToken = jwt.verify(jwtToken, jwtSecret) as JwtPayload;

  return decodedToken;
};
