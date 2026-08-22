import mongoose from "mongoose";

const PendingZerodoseSchema = new mongoose.Schema(
  {
    // ------------------------------------------------------------
    // Original Zerodose
    // ------------------------------------------------------------

    zerodose: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zerodose",
      required: true,
      unique: true,
      index: true,
    },

    // ------------------------------------------------------------
    // Worker who requested the update
    // ------------------------------------------------------------

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ------------------------------------------------------------
    // Supervisor who will approve
    // ------------------------------------------------------------

    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ------------------------------------------------------------
    // Old values
    //
    // These are stored so supervisor can clearly see:
    // OLD -> NEW
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // New requested values
    // ------------------------------------------------------------

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

    // ------------------------------------------------------------
    // Which fields actually changed
    // ------------------------------------------------------------

    changedFields: [
      {
        type: String,
        enum: [
          "childName",
          "fatherName",
          "age",
          "address",
          "contactNo",
          "location",
        ],
      },
    ],

    // ------------------------------------------------------------
    // Status
    // ------------------------------------------------------------

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // ------------------------------------------------------------
    // Supervisor approval
    // ------------------------------------------------------------

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

export default mongoose.models.PendingZerodose ||
  mongoose.model("PendingZerodose", PendingZerodoseSchema);
