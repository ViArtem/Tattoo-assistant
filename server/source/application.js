import express from "express";
import TelegramManager from "./telegramManager/telegramManager.js";

import path from "path";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import { imageRouter } from "./webRequest/router/imageRouter.js";

const app = express();
const PORT = process.env.PORT || 8080;

const middleware = [cors(), express.json(), imageRouter];
middleware.forEach((elm) => {
  app.use(elm);
});
app.use("/images", express.static(path.resolve("images")));

app.listen(PORT, async () => {
  await TelegramManager.botStarted();
  console.log("Server has been started ...");
});
