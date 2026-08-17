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

// Automatically determine campaign status
campaignSchema.virtual("campaignStatus").get(function () {
  const now = new Date();

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

// Validate dates
campaignSchema.pre("validate", function () {
  if (this.startDate > this.endDate) {
    throw new Error("Campaign end date cannot be before start date.");
  }
});

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
