import LinkStats from "../models/linkStats.model.js";

export const getLinkAnalyticsbySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const stats = await LinkStats.findOne({
      slug,
    });

    if (!stats) {
      return res.status(404).json({
        message: "Analytics not found",
      });
    }

    return res.json({
      analytics: stats,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getLinkAnalyticsbyTimestampAndSlug = async (req, res) => {
  try {
    const { timestamp, slug } = req.params;
    const start = new Date(timestamp);
    start.setHours(0, 0, 0, 0);

    const end = new Date(timestamp);
    end.setHours(23, 59, 59, 999);

    const stats = await LinkStats.find({
      slug,
      last_updated: {
        $gte: start,
        $lte: end,
      },
    });
    

    if (!stats) {
      return res.status(404).json({
        message: "Analytics not found",
      });
    }

    return res.json({
      analytics: stats,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};