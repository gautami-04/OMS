const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    outage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlannedOutage",
      required: true,
    },

    fieldEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);