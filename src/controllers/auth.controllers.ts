import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { encrypt } from "../helpers/encrypt";
import { jsonwebtoken } from "../helpers/jwt";
import { TwilioActions } from "../helpers/twillo";
import { Request, Response } from "express";
import * as cache from "memory-cache";

const cacheMemory = cache;

export class AuthController {
  private static userRepo = AppDataSource.getRepository(User);
  private static twilio = TwilioActions;

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const fromCache = cacheMemory.get(`user:${email}`);
      if (fromCache) {
        const data = JSON.parse(fromCache);
        const token = await jsonwebtoken.sign({ id: data.id });

        return res.status(200).json({
          message: "Data from cache",

          token,
        });
      }

      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const comparePassword = encrypt.comparePassword(password, user.password);
      if (!comparePassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.verified) {
        const msg = await this.twilio.sendVerificationCode(user.phone);
        return res.status(403).json({
          message: "Please verify your account with the verification code",
        });
      }

      const token = await jsonwebtoken.sign({ id: user.id });
      cacheMemory.put(`user:${email}`, JSON.stringify(user), 30 * 60 * 1000); // Cache for 30 minutes
      return res.status(200).json({ token });
    } catch (error) {
      console.error("Error during login: ", error); // Better logging
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, phone } = req.body;
      const user = new User();
      user.name = name;
      user.email = email;
      user.phone = phone;
      user.password = await encrypt.encryptPassword(password); // Await if it's async

      await this.userRepo.save(user);
      await this.twilio.sendVerificationCode(phone);

      cacheMemory.del(`user`);
      return res
        .status(201)
        .json({ message: "User created", data: user.phone });
    } catch (error) {
      console.error("Error during registration: ", error); // Consistent logging
      return res.status(500).json({ message: "Internal server error", error });
    }
  }

  static async verifyCode(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;
      const user = await this.userRepo.findOne({ where: { phone } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.verified) {
        return res.status(400).json({ message: "User already verified" });
      }

      const verification = await this.twilio.verifyCode(phone, code);
      if (verification.verificationStatus === "approved") {
        user.verified = true;
        await this.userRepo.save(user);

        const token = await jsonwebtoken.sign({ id: user.id });

        cacheMemory.del(`user:${user.id}`);
        cacheMemory.del(`user`);

        return res.status(200).json({ message: "User verified", token });
      } else {
        return res.status(401).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error("Error during verification: ", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
