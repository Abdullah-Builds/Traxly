import mongoose from "mongoose";

const clickEventSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    index: true,
  },

  workspace_id: {
    type: String,
    required: true,
    index: true,
  },

  ip: String,
  country: String,
  city: String,

  device: String,
  browser: String,
  os: String,

  referrer: String,
  referrer_type: String,

  clicked_at: {
    type: Date,
    default: Date.now,
  },
});

clickEventSchema.index({
  slug: 1,
  clicked_at: -1,
});

clickEventSchema.index({
  workspace_id: 1,
  clicked_at: -1,
});

export default mongoose.model("ClickEvent", clickEventSchema);