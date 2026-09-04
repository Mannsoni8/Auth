import express from "express";
import morgan from "morgan";
import router from "../routes/auth.route.js";
import cookieParser from "cookie-parser";
const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser())

app.use("/auth", router);

export default app;
