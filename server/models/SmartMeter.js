const mongoose = require("mongoose");

const smartMeterSchema = new mongoose.Schema(
  {
    meterNumber: {
      type: String,
      required: [true, "Meter number is required"],
      unique: true,
      trim: true,
    },
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consumer",
      required: [true, "Consumer reference is required"],
    },
    status: {
      type: String,
      enum: ["Online", "Offline", "Warning"],
      default: "Online",
    },
    voltage: {
      type: Number,
      default: 230,
    },
    current: {
      type: Number,
      default: 0,
    },
    power: {
      type: Number,
      default: 0,
    },
    lastReading: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SmartMeter", smartMeterSchema);
