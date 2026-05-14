import mongoose from "mongoose";

const linkStatsSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
        date: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    location: [
      {
        loc: {
          type: String,
        },
      },
    ],

    network: [
      {
        ip: String,
        carrier: String,
        vpn: {
          type: Boolean,
          default: false,
        },
      },
    ],

    top_city: [
      {
        city: String,
      },
    ],

    top_countries: [
      {
        country: String,
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    browser: [
      {
        browser: String,
      },
    ],

    OS: [
      {
        os: String,
      },
    ],

    top_devices: [
      {
        device: String,
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    source: [
      {
        source: String,
      },
    ],

    top_referrers: [
      {
        source: String,
        count: {
          type: Number,
          default: 0,
        },
      },
    ],

    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default  mongoose.model("LinkStats", linkStatsSchema);

