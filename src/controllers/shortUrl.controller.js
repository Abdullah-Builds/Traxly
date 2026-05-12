import prisma from "../config/prisma.js";

import ClickEvent from "../models/clickEvent.model.js";
import LinkStats from "../models/linkStats.model.js";

export const redirectShortUrl = async (req, res) => {
  try {
    const { slug } = req.params;

    const shortUrl = await prisma.shortUrl.findUnique({
      where: {
        slug,
      },
    });

    if (!shortUrl) {
      return res.status(404).json({
        message: "Short URL not found",
      });
    }

    if (!shortUrl.is_active) {
      return res.status(403).json({
        message: "Link disabled",
      });
    }

    if (
      shortUrl.expires_at &&
      new Date(shortUrl.expires_at) < new Date()
    ) {
      return res.status(403).json({
        message: "Link expired",
      });
    }

    /* ---------------- CLICK EVENT ---------------- */

    const clickData = {
      slug,
      workspace_id: shortUrl.workspace_id,

      ip: req.ip,

      country: "PK",
      city: "Karachi",

      device: "desktop",
      browser: "Chrome",
      os: "Windows",

      referrer: req.get("Referrer") || "direct",
      referrer_type: "direct",
    };

    await ClickEvent.create(clickData);

    /* ---------------- UPDATE STATS ---------------- */

    let stats = await LinkStats.findOne({ slug });

    const today = new Date().toISOString().split("T")[0];

    if (!stats) {
      stats = await LinkStats.create({
        slug,
        workspace_id: shortUrl.workspace_id,

        total_clicks: 1,

        daily_clicks: [
          {
            date: today,
            count: 1,
          },
        ],

        top_countries: [
          {
            country: clickData.country,
            count: 1,
          },
        ],

        top_devices: [
          {
            device: clickData.device,
            count: 1,
          },
        ],

        top_referrers: [
          {
            source: clickData.referrer_type,
            count: 1,
          },
        ],
      });
    } else {
      stats.total_clicks += 1;

      stats.last_updated = new Date();

      const existingDay = stats.daily_clicks.find(
        (d) => d.date === today
      );

      if (existingDay) {
        existingDay.count += 1;
      } else {
        stats.daily_clicks.push({
          date: today,
          count: 1,
        });
      }

      await stats.save();
    }

    return res.redirect(shortUrl.original_url);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};