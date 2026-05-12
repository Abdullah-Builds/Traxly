import LinkStats from "../models/linkStats.model.js";

export const getLinkAnalytics = async (req, res) => {
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