import * as bcrypt from "bcrypt";

export class encrypt {
  static encryptPassword(password: string) {
    return bcrypt.hashSync(password, 10);
  }
  static comparePassword(password: string, hash: string) {
    return bcrypt.compareSync(password, hash);
  }
}
