import express from "express";

import {
  redirectShortUrl,
} from "../controllers/shortUrl.controller.js";

import {
  getLinkAnalytics,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/:slug", redirectShortUrl);

router.get(
  "/analytics/:slug",
  getLinkAnalytics
);

export default router;