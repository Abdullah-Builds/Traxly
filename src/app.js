import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from 'cors';

import "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";

import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redis.js";

import urlRoutes from "./routes/url.routes.js";
import linkRoutes from "./routes/link.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Redis Cloud session store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

app.use(
  session({
    store: redisStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set true in production (HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.use("/api", linkRoutes);
app.use("/auth", authRoutes);
app.use("/", urlRoutes);

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Google OAuth</title>

      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #f4f4f4;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }

        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          text-align: center;
          width: 400px;
        }

        h1 {
          margin-bottom: 10px;
          color: #333;
        }

        p {
          color: #666;
          margin-bottom: 30px;
        }

        .btn {
          display: inline-block;
          padding: 14px 24px;
          background: #4285F4;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: bold;
          transition: 0.3s;
        }

        .btn:hover {
          background: #3367d6;
        }

        .links {
          margin-top: 25px;
        }

        .links a {
          display: block;
          margin: 10px 0;
          color: #4285F4;
          text-decoration: none;
        }

        .links a:hover {
          text-decoration: underline;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <h1>Google OAuth Demo</h1>

        <p>
          Authenticate users using Passport.js + Google OAuth + Prisma.
        </p>

        <a class="btn" href="/auth/google">
          Login with Google
        </a>

        <div class="links">
          <a href="/auth/profile">View Profile</a>
          <a href="/auth/logout">Logout</a>
        </div>
      </div>
    </body>
    </html>
  `);
});


export default app;