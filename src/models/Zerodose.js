import mongoose from "mongoose";

const zerodoseSchema = new mongoose.Schema(
  {
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: true,
      index: true,
    },

    townId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Town",
      required: true,
      index: true,
    },

    unionCouncilId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UnionCouncil",
      required: true,
      index: true,
    },

    ucmoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    childName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    contactNo: {
      type: String,
      trim: true,
    },

    recordDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    visitDate: {
      type: Date,
    },

    coveredDate: {
      type: Date,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    clientStatus: {
      type: String,
      enum: ["available", "refusal", "sick", "not_available", "deceased"],
      default: null,
      index: true,
    },
    vaccinationStatus: {
      type: String,
      enum: ["recorded", "visited", "covered"],
      default: "recorded",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

const Zerodose =
  mongoose.models.Zerodose || mongoose.model("Zerodose", zerodoseSchema);

export default Zerodose;
