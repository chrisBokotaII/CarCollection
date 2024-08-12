import express from "express";
import { AuthController } from "../controllers/auth.controllers";
import { middlewares } from "../middleware/auth.middleware";

const authRouter = express.Router();

authRouter.post("/login", AuthController.login.bind(AuthController));
authRouter.post(
  "/rigester",
  middlewares.phoneVerification,
  AuthController.register.bind(AuthController)
);
authRouter.post("/activate", AuthController.verifyCode.bind(AuthController));

export { authRouter };
