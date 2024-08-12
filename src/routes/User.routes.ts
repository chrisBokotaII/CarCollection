import * as express from "express";
import { AuthController } from "../controllers/auth.controllers";
import { middlewares } from "../middleware/auth.middleware";
import { UserController } from "../controllers/user.controller";

const UserRouter = express.Router();

UserRouter.get(
  "/all",
  middlewares.auth,
  UserController.getAllUsers.bind(AuthController)
);
UserRouter.get(
  "/:id",
  middlewares.auth,
  UserController.getUser.bind(UserController)
);

UserRouter.patch(
  "/",
  middlewares.auth,
  UserController.updateUser.bind(UserController)
);
UserRouter.delete(
  "/delete",
  middlewares.auth,
  UserController.deleteUser.bind(UserController)
);

export { UserRouter };
