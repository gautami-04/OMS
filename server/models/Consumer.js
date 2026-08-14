const mongoose = require("mongoose");

const consumerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    consumerNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    transformer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transformer",
      required: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Consumer", consumerSchema);