import mongoose from "mongoose";

const linkStatsSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    required: true,
  },

  workspace_id: {
    type: String,
    required: true,
  },

  total_clicks: {
    type: Number,
    default: 0,
  },

  daily_clicks: [
    {
      date: String,
      count: Number,
    },
  ],

  top_countries: [
    {
      country: String,
      count: Number,
    },
  ],

  top_devices: [
    {
      device: String,
      count: Number,
    },
  ],

  top_referrers: [
    {
      source: String,
      count: Number,
    },
  ],

  last_updated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("LinkStats", linkStatsSchema);