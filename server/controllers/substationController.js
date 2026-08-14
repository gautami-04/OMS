const Substation = require("../models/Substation");

const getSubstations = async (req, res) => {
  try {
    const substations = await Substation.find();

    res.status(200).json(substations);
  } catch (error) {
    console.error("Get substations error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getSubstations,
};