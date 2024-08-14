import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Ipayload } from "../lib/interfaces";
dotenv.config();

export class jsonwebtoken {
  static async sign(payload: Ipayload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }
  static async verify(token: string): Promise<Ipayload> {
    return jwt.verify(token, process.env.JWT_SECRET) as Ipayload;
  }
}
