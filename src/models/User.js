import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [4, "Name must be at least 4 characters"],
      maxlength: [30, "Name cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: function () {
        return this.designation !== "worker";
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
      select: false,
    },

    emailVerificationCode: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    approvalStatus: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Invalid approval status",
      },
      default: function () {
        return [
          "ucmo",
          "supervisor",
          "vaccinator",
          "otherStaff",
          "townFP",
          "districtFP",
        ].includes(this.designation)
          ? "pending"
          : null;
      },
      validate: {
        validator: function (value) {
          return (
            value === null ||
            [
              "ucmo",
              "supervisor",
              "vaccinator",
              "otherStaff",
              "townFP",
              "districtFP",
            ].includes(this.designation)
          );
        },
        message: "Only users requiring approval can have an approval status.",
      },
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      match: [/^03\d{9}$/, "Please enter a valid Pakistani mobile number"],
    },

    designation: {
      type: String,
      required: [true, "Designation is required"],
      enum: {
        values: [
          "ucmo",
          "supervisor",
          "vaccinator",
          "otherStaff",
          "townFP",
          "districtFP",
          "worker",
          "admin",
        ],
        message: "Invalid designation",
      },
    },

    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: function () {
        return this.designation !== "admin";
      },
      default: null,
      validate: {
        validator: function (value) {
          if (this.designation === "admin") {
            return !value;
          }

          return !!value;
        },
        message: "District is required for this designation.",
      },
    },

    town: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Town",
      required: function () {
        return [
          "ucmo",
          "supervisor",
          "vaccinator",
          "otherStaff",
          "worker",
          "townFP",
        ].includes(this.designation);
      },
      default: null,
      validate: {
        validator: async function (value) {
          const requiresTown = [
            "ucmo",
            "supervisor",
            "vaccinator",
            "otherStaff",
            "worker",
            "townFP",
          ].includes(this.designation);

          if (!requiresTown) {
            return !value;
          }

          if (!value || !this.district) {
            return false;
          }

          const Town = mongoose.model("Town");

          const town = await Town.findOne({
            _id: value,
            district: this.district,
          }).select("_id");

          return !!town;
        },
        message:
          "A valid town belonging to the selected district is required for this designation.",
      },
    },

    unionCouncil: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnionCouncil",
      required: function () {
        return [
          "ucmo",
          "supervisor",
          "vaccinator",
          "otherStaff",
          "worker",
        ].includes(this.designation);
      },
      default: null,
      validate: {
        validator: async function (value) {
          const requiresUnionCouncil = [
            "ucmo",
            "supervisor",
            "vaccinator",
            "otherStaff",
            "worker",
          ].includes(this.designation);

          if (!requiresUnionCouncil) {
            return !value;
          }

          if (!value || !this.district || !this.town) {
            return false;
          }

          const UnionCouncil = mongoose.model("UnionCouncil");

          const unionCouncil = await UnionCouncil.findOne({
            _id: value,
            town: this.town,
            district: this.district,
          }).select("_id");

          return !!unionCouncil;
        },
        message:
          "A valid union council belonging to the selected district and town is required for this designation.",
      },
    },

    ucmo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      validate: {
        validator: async function (value) {
          if (this.designation === "worker") {
            if (!value) {
              return false;
            }

            const ucmo = await mongoose.model("User").findOne({
              _id: value,
              designation: "ucmo",
              isActive: true,
            });

            return !!ucmo;
          }

          return !value;
        },
        message: "A valid active UCMO is required only for workers.",
      },
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      validate: {
        validator: async function (value) {
          if (this.designation === "worker") {
            if (!value) {
              return false;
            }

            const supervisor = await mongoose.model("User").findOne({
              _id: value,
              designation: "supervisor",
              isActive: true,
            });

            return !!supervisor;
          }

          return !value;
        },
        message: "A valid active supervisor is required only for workers.",
      },
    },

    supervisorCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      validate: {
        validator: function (value) {
          if (this.designation === "supervisor") {
            return !!value && value.trim().length > 0;
          }

          return !value;
        },
        message: "Supervisor Code is required only for supervisor designation.",
      },
    },

    teamNumber: {
      type: Number,
      default: null,
      validate: {
        validator: function (value) {
          if (this.designation === "worker") {
            return value !== null && value !== undefined;
          }

          return value === null || value === undefined;
        },
        message: "Team number is required only for workers.",
      },
    },

    workerRole: {
      type: String,
      enum: {
        values: ["teamLeader", "teamMember"],
        message: "Invalid worker role",
      },
      default: null,
      validate: {
        validator: function (value) {
          if (this.designation === "worker") {
            return !!value;
          }

          return value === null || value === undefined;
        },
        message: "Worker role is required only for workers.",
      },
    },

    password: {
      type: String,
      required: function () {
        return this.designation !== "worker";
      },
      minlength: [8, "Password must be at least 8 characters"],
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

userSchema.index(
  {
    unionCouncil: 1,
    supervisorCode: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      designation: "supervisor",
      isActive: true,
    },
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
