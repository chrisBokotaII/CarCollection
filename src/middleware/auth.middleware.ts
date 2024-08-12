import { NextFunction, Request, Response } from "express";
import { jsonwebtoken } from "../helpers/jwt";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Ipayload } from "../lib/interfaces";
import * as cache from "memory-cache";
import { createHmac } from "crypto";
const redisClient = cache;

export class middlewares {
  static async auth(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized" });
      }

      const user = (await jsonwebtoken.verify(token)) as Ipayload;

      if (!user) {
        res.status(401).json({ message: "Unauthorized" });
      }

      const fromRedis = redisClient.get(`User:${user.id}`);
      if (fromRedis) {
        console.log("reeeeedis");
        req["current-user"] = JSON.parse(fromRedis);
        return next();
      }

      const userRepo = AppDataSource.getRepository(User);
      const currentUser = await userRepo.findOne({ where: { id: user.id } });

      if (!currentUser) {
        res.status(401).json({ message: "Unauthorized" });
      }

      redisClient.put(`User:${user.id}`, JSON.stringify(user));

      req["current-user"] = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
  static blockDirectAccess(req: Request, res: Response, next: NextFunction) {
    const { SECRET, KEY } = process.env;

    const origin = req.get("x-added");
    if (!origin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const hash = createHmac("sha256", KEY)
      .update(req.method + SECRET)
      .digest("hex");

    if (origin === hash) {
      return next();
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
    next();
  }
  static async phoneVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { phone } });
    if (user) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    next();
  }
}
