import express from "express";

import {
  createShortUrl,
  getAllLinks,
  updateLink,
  deleteLink,
} from "../controllers/link.controller.js";

import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* CREATE SHORT URL */
router.post(
  "/shorten",
  isAuthenticated,
  createShortUrl
);

/* GET ALL LINKS */
router.get(
  "/links",
  isAuthenticated,
  getAllLinks
);

/* UPDATE LINK */
router.patch(
  "/links/:id",
  isAuthenticated,
  updateLink
);

/* DELETE LINK */
router.delete(
  "/links/:id",
  isAuthenticated,
  deleteLink
);

export default router;