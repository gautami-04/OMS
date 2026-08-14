const Feeder = require("../models/Feeder");

const getFeeders = async (req, res) => {
  try {
    const feeders = await Feeder.find();

    res.status(200).json(feeders);
  } catch (error) {
    console.error("Get feeders error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getFeeders,
};