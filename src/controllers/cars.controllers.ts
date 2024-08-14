import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Cars } from "../entity/Cars";
import * as cache from "memory-cache";
import { User } from "../entity/User";
import { CarDto } from "../lib/app.dtos";

const cacheMemory = cache;

export class CarsController {
  private static carRepo = AppDataSource.getRepository(Cars);
  private static userRepo = AppDataSource.getRepository(User);

  static async getAllCars(req: Request, res: Response) {
    try {
      const fromCache = cacheMemory.get("cars");
      if (fromCache) {
        return res.status(200).json({
          message: "Data from cache",
          data: JSON.parse(fromCache),
        });
      }

      const cars = await this.carRepo.find();
      cacheMemory.put("cars", JSON.stringify(cars));
      return res.status(200).json({
        message: "Data from database",
        data: cars,
      });
    } catch (error) {
      console.error("Error fetching all cars:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async getCarById(req: Request, res: Response) {
    const { carId } = req.params;
    try {
      const fromCache = cacheMemory.get(`car:${carId}`);
      if (fromCache) {
        return res.status(200).json({
          message: "Data from cache",
          data: JSON.parse(fromCache),
        });
      }

      const car = await this.carRepo.findOne({
        where: { id: carId },
        relations: ["user"],
      });
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      const { user, ...results } = car;
      const { password, ...result } = user;

      const carDto = new CarDto();
      carDto.car = results;
      carDto.owner = result;

      cacheMemory.put(`car:${carId}`, JSON.stringify(carDto), 30 * 60 * 1000);
      return res.status(200).json({
        message: "Data from database",
        data: carDto,
      });
    } catch (error) {
      console.error(`Error fetching car with id ${carId}:`, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async createCar(req: Request, res: Response) {
    const { id } = req["current-user"];
    try {
      const {
        name,
        brand,
        model,
        year,
        fuel,
        transmission,
        price,
        color,
        mileage,
        description,
        image,
        status,
      } = req.body;

      if (!name || !brand || !model || !year || !fuel || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const car = new Cars();
      car.name = name;
      car.brand = brand;
      car.model = model;
      car.year = year;
      car.fuel = fuel;
      car.transmission = transmission;
      car.price = price;
      car.color = color;
      car.mileage = mileage;
      car.description = description;
      car.image = image;
      car.status = status;
      car.user = user;
      await this.carRepo.save(car);

      cacheMemory.del("cars");
      return res.status(201).json({ message: "Car created" });
    } catch (error) {
      console.error("Error creating car:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async updateCar(req: Request, res: Response) {
    const { carId } = req.params;
    const { id } = req["current-user"];
    const {
      name,
      brand,
      model,
      year,
      fuel,
      transmission,
      price,
      color,
      mileage,
      description,
      image,
      status,
    } = req.body;

    try {
      const car = await this.carRepo.findOne({
        where: { id: carId },
        relations: ["user"],
      });
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      if (car.user.id !== id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to update this car" });
      }

      car.name = name;
      car.brand = brand;
      car.model = model;
      car.year = year;
      car.fuel = fuel;
      car.transmission = transmission;
      car.price = price;
      car.color = color;
      car.mileage = mileage;
      car.description = description;
      car.image = image;
      car.status = status;
      await this.carRepo.save(car);

      cacheMemory.del(`car:${carId}`);
      cacheMemory.del("cars");
      cacheMemory.del(`user:${id}`);

      return res.status(200).json({ message: "Car updated", car });
    } catch (error) {
      console.error(`Error updating car with id ${carId}:`, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  static async deleteCar(req: Request, res: Response) {
    const { carId } = req.params;
    const { id } = req["current-user"];
    try {
      const car = await this.carRepo.findOne({
        where: { id: carId },
      });
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      if (car.user.id !== id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this car" });
      }

      await this.carRepo.delete(carId);

      cacheMemory.del(`car:${carId}`);
      cacheMemory.del("cars");
      cacheMemory.del(`user:${id}`);
      return res.status(200).json({ message: "Car deleted" });
    } catch (error) {
      console.error(`Error deleting car with id ${carId}:`, error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
