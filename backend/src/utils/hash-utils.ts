import bcrypt from "bcryptjs";

export const hash = (plainText: string) => {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(plainText, salt);
  return hash;
};

export const comparePlainTextToHashedText = (plainText: string, hash: string) => {
  return bcrypt.compareSync(plainText, hash);
};
