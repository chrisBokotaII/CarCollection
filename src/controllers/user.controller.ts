import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Request, Response } from "express";
import * as cache from "memory-cache";
import { usersDto } from "../lib/app.dtos";

const cacheMemory = cache;

export class UserController {
  private static userRepo = AppDataSource.getRepository(User);

  static async getAllUsers(req: Request, res: Response) {
    try {
      const fromCache = cacheMemory.get("users");
      if (fromCache) {
        return res.status(200).json({
          message: "Data from cache",
          data: JSON.parse(fromCache),
        });
      }

      const users = await this.userRepo.find();
      const rem = users.map((user) => {
        const { password, ...result } = user;
        return result;
      });

      const userRes = new usersDto();
      userRes.user = rem;
      cacheMemory.put("users", JSON.stringify(userRes));
      return res
        .status(200)
        .json({ message: "Data from database", data: userRes });
    } catch (error) {
      console.error("Error fetching all users: ", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const fromCache = cacheMemory.get(`user:${id}`);
      if (fromCache) {
        return res
          .status(200)
          .json({ message: "Data from cache", data: JSON.parse(fromCache) });
      }

      const user = await this.userRepo.findOne({
        where: { id },
        relations: ["cars"],
      });
      const { password, ...result } = user;
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      cacheMemory.put(`user:${id}`, JSON.stringify(result), 30 * 60 * 1000); //cahe for 30 minutes
      return res
        .status(200)
        .json({ message: "Data from database", data: result });
    } catch (error) {
      console.error(`Error fetching user with id ${id}: `, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req["current-user"];
    const { name, email } = req.body;

    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: ["cars"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.name = name;
      user.email = email;
      await this.userRepo.save(user);

      cacheMemory.del(`user:${id}`);

      cacheMemory.del("users");

      user.cars.forEach((car) => cacheMemory.del(`car:${car.id}`));

      return res.status(200).json({ message: "User updated" });
    } catch (error) {
      console.error(`Error updating user with id ${id}: `, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Delete user and clear relevant cache entries
  static async deleteUser(req: Request, res: Response) {
    const { id } = req["current-user"];

    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: ["cars"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await this.userRepo.remove(user);

      cacheMemory.del(`user:${id}`);

      cacheMemory.del("users");

      cacheMemory.del("cars");

      user.cars.forEach((car) => cacheMemory.del(`car:${car.id}`));

      return res.status(200).json({ message: "User deleted" });
    } catch (error) {
      console.error(`Error deleting user with id ${id}: `, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
