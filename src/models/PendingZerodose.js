import mongoose from "mongoose";

const PendingZerodoseSchema = new mongoose.Schema(
  {
    zerodose: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zerodose",
      required: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    oldData: {
      childName: {
        type: String,
        default: null,
      },

      fatherName: {
        type: String,
        default: null,
      },

      age: {
        type: Number,
        default: null,
      },

      address: {
        type: String,
        default: null,
      },

      contactNo: {
        type: String,
        default: null,
      },

      houseNumber: {
        type: Number,
        default: null,
      },

      gender: {
        type: String,
        enum: ["male", "female"],
        default: null,
      },

      location: {
        latitude: {
          type: Number,
          default: null,
        },

        longitude: {
          type: Number,
          default: null,
        },
      },
    },

    newData: {
      childName: {
        type: String,
        default: null,
      },

      fatherName: {
        type: String,
        default: null,
      },

      age: {
        type: Number,
        default: null,
      },

      address: {
        type: String,
        default: null,
      },

      contactNo: {
        type: String,
        default: null,
      },

      houseNumber: {
        type: Number,
        default: null,
      },

      gender: {
        type: String,
        enum: ["male", "female"],
        default: null,
      },

      location: {
        latitude: {
          type: Number,
          default: null,
        },

        longitude: {
          type: Number,
          default: null,
        },
      },
    },

    changedFields: [
      {
        type: String,
        enum: [
          "childName",
          "fatherName",
          "age",
          "address",
          "contactNo",
          "houseNumber",
          "gender",
          "location",
        ],
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
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

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

PendingZerodoseSchema.index(
  { zerodose: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "pending",
    },
  },
);

export default mongoose.models.PendingZerodose ||
  mongoose.model("PendingZerodose", PendingZerodoseSchema);
