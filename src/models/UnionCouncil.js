import mongoose from 'mongoose';

const unionCouncilSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Union Council name is required'],
      trim: true,
      minlength: [2, 'Union Council name must be at least 2 characters'],
      maxlength: [100, 'Union Council name cannot exceed 100 characters'],
    },

    code: {
      type: Number,
      required: [true, 'Union Council code is required'],
      unique: true,
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
    },

    town: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Town',
      required: [true, 'Town is required'],
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

unionCouncilSchema.index({ town: 1, name: 1 }, { unique: true });

const UnionCouncil =
  mongoose.models.UnionCouncil ||
  mongoose.model('UnionCouncil', unionCouncilSchema);

export default UnionCouncil;
