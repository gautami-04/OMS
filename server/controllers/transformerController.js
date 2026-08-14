const Transformer = require("../models/Transformer");

const getTransformers = async (req, res) => {
  try {
    const transformers = await Transformer.find();

    res.status(200).json(transformers);
  } catch (error) {
    console.error("Get transformers error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getTransformers,
};