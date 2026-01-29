import bcryptjs from 'bcryptjs';
import envVariables from '../config/env';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(envVariables.BCRYPT_SALT_ROUNDS, 10);
  const hashedPassword = await bcryptjs.hash(password, saltRounds);
  return hashedPassword;
};
