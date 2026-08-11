import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "District name is required"],
      trim: true,
      unique: true,
      minlength: [2, "District name must be at least 2 characters"],
      maxlength: [100, "District name cannot exceed 100 characters"],
    },

    code: {
      type: Number,
      required: [true, "Code is required"],
      unique: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Search / sorting ke liye
districtSchema.index({ name: 1 });
districtSchema.index({ code: 1 });
districtSchema.index({ isActive: 1 });
districtSchema.index({ createdAt: -1 });

const District =
  mongoose.models.District || mongoose.model("District", districtSchema);

export default District;
