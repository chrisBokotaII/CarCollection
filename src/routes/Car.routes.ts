import express from "express";
import { CarsController } from "../controllers/cars.controllers";
import { middlewares } from "../middleware/auth.middleware";

const CarRouter = express.Router();

CarRouter.get(
  "/cars",
  middlewares.auth,
  CarsController.getAllCars.bind(CarsController)
);

CarRouter.get(
  "/car/:id",
  middlewares.auth,
  CarsController.getCarById.bind(CarsController)
);

CarRouter.post(
  "/car",
  middlewares.auth,
  CarsController.createCar.bind(CarsController)
);

CarRouter.patch(
  "/car/:id",
  middlewares.auth,
  CarsController.updateCar.bind(CarsController)
);

CarRouter.delete(
  "/car",
  middlewares.auth,
  CarsController.deleteCar.bind(CarsController)
);

export { CarRouter };
