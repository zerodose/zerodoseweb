import mongoose from 'mongoose';

const townSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Town name is required'],
      trim: true,
      minlength: [2, 'Town name must be at least 2 characters'],
      maxlength: [100, 'Town name cannot exceed 100 characters'],
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'District is required'],
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

// Same district mein same town name allowed nahi hoga
townSchema.index({ district: 1, name: 1 }, { unique: true });

const Town = mongoose.models.Town || mongoose.model('Town', townSchema);

export default Town;
