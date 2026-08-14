const mongoose = require("mongoose");

const feederSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    substation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Substation",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Feeder", feederSchema);