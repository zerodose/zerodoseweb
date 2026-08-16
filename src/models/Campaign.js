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

    isActive: {
      type: Boolean,
      default: true,
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

/* =========================================================
   Campaign Active Status
   Campaign is active only between startDate and endDate.
   ========================================================= */

campaignSchema.virtual("campaignStatus").get(function () {
  const now = new Date();

  if (!this.isActive) {
    return "inactive";
  }

  const startDate = new Date(this.startDate);

  const endDate = new Date(this.endDate);
  endDate.setHours(23, 59, 59, 999);

  if (now < startDate) {
    return "upcoming";
  }

  if (now > endDate) {
    return "previous";
  }

  return "current";
});

/* =========================================================
   Validate Dates
   ========================================================= */

campaignSchema.pre("validate", function () {
  if (this.startDate && this.endDate) {
    if (this.startDate > this.endDate) {
      throw new Error("Campaign end date cannot be before start date.");
    }
  }
});

/* =========================================================
   Model
   ========================================================= */

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
