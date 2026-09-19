import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["NID", "SNID"],
      uppercase: true,
      trim: true,
    },

    scope: {
      type: String,
      required: true,
      enum: ["nationwide", "high_risk_districts", "sindh_karachi", "karachi"],
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);
// ============================================================
// CAMPAIGN STATUS
// Date-based only
// ============================================================

campaignSchema.virtual("campaignStatus").get(function () {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startDate = new Date(
    this.startDate.getFullYear(),
    this.startDate.getMonth(),
    this.startDate.getDate(),
  );

  const endDate = new Date(
    this.endDate.getFullYear(),
    this.endDate.getMonth(),
    this.endDate.getDate(),
  );

  if (today < startDate) {
    return "upcoming";
  }

  if (today > endDate) {
    return "previous";
  }

  return "current";
});

// ============================================================
// VALIDATE DATES
// ============================================================

campaignSchema.pre("validate", function () {
  if (this.startDate > this.endDate) {
    throw new Error("Campaign end date cannot be before start date.");
  }
});

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
