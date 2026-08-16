// import mongoose from "mongoose";

// const campaignSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       enum: ["NID", "SNID"],
//       uppercase: true,
//       trim: true,
//     },

//     year: {
//       type: Number,
//       required: true,
//     },

//     month: {
//       type: Number,
//       required: true,
//     },

//     startDate: {
//       type: Date,
//       required: true,
//     },

//     endDate: {
//       type: Date,
//       required: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// const Campaign =
//   mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

// export default Campaign;

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

campaignSchema.virtual("isCampaignActive").get(function () {
  const now = new Date();

  if (!this.isActive) {
    return false;
  }

  if (!this.startDate || !this.endDate) {
    return false;
  }

  const startDate = new Date(this.startDate);

  const endDate = new Date(this.endDate);
  endDate.setHours(23, 59, 59, 999);

  return now >= startDate && now <= endDate;
});

/* =========================================================
   Validate Dates
   ========================================================= */

campaignSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate) {
    if (this.startDate > this.endDate) {
      return next(new Error("Campaign end date cannot be before start date."));
    }
  }

  next();
});

const Campaign =
  mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
