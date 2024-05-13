import bcrypt from "bcryptjs";

export const encryptPassword = (password) => bcrypt.hash(password, 10);

export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);
