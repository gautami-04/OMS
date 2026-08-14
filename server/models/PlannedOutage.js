const mongoose = require("mongoose");

const plannedOutageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    feeder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feeder",
      required: true,
    },

    transformer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transformer",
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Restored"],
      default: "Scheduled",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlannedOutage", plannedOutageSchema);