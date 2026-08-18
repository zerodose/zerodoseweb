import mongoose, { Schema } from "mongoose";

const zerodoseSchema = new Schema(
  {
    campaign: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    district: {
      type: Schema.Types.ObjectId,
      ref: "District",
      required: true,
      index: true,
    },

    town: {
      type: Schema.Types.ObjectId,
      ref: "Town",
      required: true,
      index: true,
    },

    unionCouncil: {
      type: Schema.Types.ObjectId,
      ref: "UnionCouncil",
      required: true,
      index: true,
    },

    ucmo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    supervisor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    teamLeader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    teamMember: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    teamNumber: {
      type: Number,
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
      max: 59,
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

    day: {
      type: Number,
      required: true,
      index: true,
    },

    recordDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    visitDate: {
      type: Date,
      default: null,
    },

    coveredDate: {
      type: Date,
      default: null,
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

    // =====================================================
    // UPDATE APPROVAL
    // =====================================================

    updateRequested: {
      type: Boolean,
      default: false,
      index: true,
    },

    updateRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updateRequestedAt: {
      type: Date,
      default: null,
    },

    updateData: {
      type: Schema.Types.Mixed,
      default: null,
    },

    updateApproved: {
      type: Boolean,
      default: false,
    },

    updateApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updateApprovedAt: {
      type: Date,
      default: null,
    },

    // =====================================================
    // DELETE APPROVAL
    // =====================================================

    deleteRequested: {
      type: Boolean,
      default: false,
      index: true,
    },

    deleteRequestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deleteRequestedAt: {
      type: Date,
      default: null,
    },

    deleteApproved: {
      type: Boolean,
      default: false,
    },

    deleteApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deleteApprovedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Zerodose =
  mongoose.models.Zerodose || mongoose.model("Zerodose", zerodoseSchema);

export default Zerodose;
