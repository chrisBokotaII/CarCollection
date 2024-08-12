import express from "express";
import { UserRouter } from "./routes/User.routes";
import { AppDataSource } from "./data-source";
import { middlewares } from "./middleware/auth.middleware";
import { CarRouter } from "./routes/Car.routes";
import { authRouter } from "./routes/auth.routes";

const app = express();

// Middleware to block direct access

app.use(express.json());
// do we need to set the origin to the proxy address?

// Apply blockDirectAccess middleware to routes
app.use(middlewares.blockDirectAccess);

// Internal route handling
app.use("/api", CarRouter);
app.use("/user", UserRouter);
app.use("/auth", authRouter);

// Error handling for non-existing routes
app.use("*", (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: "Not Found" });
});

// Start the server
AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected");
    app.listen(5000, () => {
      console.log("Server is running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.error(err);
  });
