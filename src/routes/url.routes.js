import express from "express";

import {
  redirectShortUrl,
} from "../controllers/shortUrl.controller.js";

import {
  getLinkAnalyticsbySlug,getLinkAnalyticsbyTimestampAndSlug
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/:slug", redirectShortUrl);

router.get(
  "/analytics/:slug",
  getLinkAnalyticsbySlug
);

router.get(
  "/analytics/:slug/:timestamp",
  getLinkAnalyticsbyTimestampAndSlug
);

export default router;