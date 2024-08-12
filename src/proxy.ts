import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import { createHmac } from "crypto";
import dotenv from "dotenv";
dotenv.config();
const app = express();

const { SECRET, KEY } = process.env;

app.use(cors());
app.use(
  "/v1",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
    pathRewrite: {
      "^/v1": "",
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        // Set custom header
        const hash = createHmac("sha256", KEY)
          .update(req.method + SECRET)
          .digest("hex");

        proxyReq.setHeader("x-added", hash);
      },
    },
  })
);

app.listen(3000, () => {
  console.log("Proxy server is running on http://localhost:3000");
});
