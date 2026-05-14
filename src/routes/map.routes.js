// routes/mapRoutes.mjs

import express from "express";
import { getLocationMap } from "../controllers/map.controller.js";

const router = express.Router();

router.get("/map", getLocationMap);

export default router;