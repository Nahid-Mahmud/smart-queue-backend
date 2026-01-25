import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import { router } from "./app/routes";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import passport from "passport";
import expressSession from "express-session";
import "./app/config/passport";
import envVariables from "./app/config/env";

export const app = express();
app.use(
  expressSession({
    secret: envVariables.EXPRESS_SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// need to handle urlencoded data from form or SSLCommerz or handling file uploads
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true, // Allow cookies to be sent with requests
  })
);

// trust proxy
app.set("trust proxy", 1);

// cookie parser
app.use(cookieParser());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to OopsiPay - Digital Wallet Management API",
    status: "success",
  });
});

app.get("/api/v1", (req: Request, res: Response) => {
  res.json({
    message: "You are in the OopsiPay API",
    status: "success",
  });
});

// route not match

app.use(globalErrorHandler);

app.use(notFound);
