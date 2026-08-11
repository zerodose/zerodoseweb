import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: function () {
        return this.designation !== 'worker';
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^03\d{9}$/, 'Please enter a valid Pakistani mobile number'],
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

    unionCouncil: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnionCouncil',
      required: [true, 'Union Council is required'],
    },

    designation: {
      type: String,
      required: [true, 'Designation is required'],
      enum: {
        values: ['ucmo', 'supervisor', 'vaccinator', 'otherStaff', 'worker', 'admin'],
        message: 'Invalid designation',
      },
    },

    supervisorCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,

      validate: {
        validator: function (value) {
          if (this.designation === 'supervisor') {
            return !!value && value.trim().length > 0;
          }

          return !value;
        },

        message: 'Supervisor Code is required only for supervisor designation',
      },
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,

      validate: {
        validator: async function (value) {
          if (this.designation === 'worker') {
            if (!value) return false;

            const supervisor = await mongoose.model('User').findOne({
              _id: value,
              designation: 'supervisor',
              isActive: true,
            });

            return !!supervisor;
          }

          return !value;
        },

        message: 'A valid active supervisor is required only for workers',
      },
    },

    teamNumber: {
      type: Number,
      default: null,

      validate: {
        validator: function (value) {
          if (this.designation === 'worker') {
            return value !== null && value !== undefined;
          }

          return value === null || value === undefined;
        },

        message: 'Team number is required only for workers',
      },
    },

    password: {
      type: String,
      required: function () {
        return this.designation !== 'worker';
      },
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
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

// Active supervisors ke supervisor codes unique honge
userSchema.index(
  { supervisorCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      designation: 'supervisor',
      isActive: true,
    },
  },
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
