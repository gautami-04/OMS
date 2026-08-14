const Consumer = require("../models/Consumer");

const getConsumers = async (req, res) => {
  try {
    const consumers = await Consumer.find();

    res.status(200).json(consumers);
  } catch (error) {
    console.error("Get consumers error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getConsumers,
};