const SmartMeter = require("../models/SmartMeter");

const getSmartMeters = async (req, res) => {
  try {
    const smartMeters = await SmartMeter.find()
      .populate({
        path: "consumer",
        populate: {
          path: "transformer",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(smartMeters);
  } catch (error) {
    console.error("Get smart meters error:", error.message);
    res.status(500).json({
      message: "Server error while fetching smart meters",
    });
  }
};

const getSmartMeterById = async (req, res) => {
  try {
    const smartMeter = await SmartMeter.findById(req.params.id).populate({
      path: "consumer",
      populate: {
        path: "transformer",
      },
    });

    if (!smartMeter) {
      return res.status(404).json({
        message: "Smart meter not found",
      });
    }

    res.status(200).json(smartMeter);
  } catch (error) {
    console.error("Get smart meter by ID error:", error.message);
    res.status(500).json({
      message: "Server error while fetching smart meter details",
    });
  }
};

const createSmartMeter = async (req, res) => {
  try {
    const {
      meterNumber,
      consumer,
      status,
      voltage,
      current,
      power,
      lastReading,
    } = req.body;

    if (!meterNumber || !consumer) {
      return res.status(400).json({
        message: "Meter number and consumer are required fields",
      });
    }

    const existingMeter = await SmartMeter.findOne({ meterNumber: meterNumber.trim() });
    if (existingMeter) {
      return res.status(400).json({
        message: `Smart meter with number "${meterNumber}" already exists`,
      });
    }

    const smartMeter = await SmartMeter.create({
      meterNumber: meterNumber.trim(),
      consumer,
      status: status || "Online",
      voltage: voltage != null ? Number(voltage) : 230,
      current: current != null ? Number(current) : 0,
      power: power != null ? Number(power) : 0,
      lastReading: lastReading || Date.now(),
    });

    const populatedMeter = await SmartMeter.findById(smartMeter._id).populate({
      path: "consumer",
      populate: {
        path: "transformer",
      },
    });

    res.status(201).json(populatedMeter);
  } catch (error) {
    console.error("Create smart meter error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Smart meter number must be unique",
      });
    }
    res.status(500).json({
      message: error.message || "Server error while creating smart meter",
    });
  }
};

const updateSmartMeter = async (req, res) => {
  try {
    const {
      meterNumber,
      consumer,
      status,
      voltage,
      current,
      power,
      lastReading,
    } = req.body;

    if (meterNumber) {
      const existing = await SmartMeter.findOne({
        meterNumber: meterNumber.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          message: `Smart meter with number "${meterNumber}" already exists`,
        });
      }
    }

    const updateData = {
      ...(meterNumber && { meterNumber: meterNumber.trim() }),
      ...(consumer && { consumer }),
      ...(status && { status }),
      ...(voltage != null && { voltage: Number(voltage) }),
      ...(current != null && { current: Number(current) }),
      ...(power != null && { power: Number(power) }),
      ...(lastReading && { lastReading }),
    };

    const smartMeter = await SmartMeter.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "consumer",
      populate: {
        path: "transformer",
      },
    });

    if (!smartMeter) {
      return res.status(404).json({
        message: "Smart meter not found",
      });
    }

    res.status(200).json(smartMeter);
  } catch (error) {
    console.error("Update smart meter error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Smart meter number must be unique",
      });
    }
    res.status(500).json({
      message: error.message || "Server error while updating smart meter",
    });
  }
};

const deleteSmartMeter = async (req, res) => {
  try {
    const smartMeter = await SmartMeter.findByIdAndDelete(req.params.id);

    if (!smartMeter) {
      return res.status(404).json({
        message: "Smart meter not found",
      });
    }

    res.status(200).json({
      message: "Smart meter deleted successfully",
    });
  } catch (error) {
    console.error("Delete smart meter error:", error.message);
    res.status(500).json({
      message: "Server error while deleting smart meter",
    });
  }
};

module.exports = {
  getSmartMeters,
  getSmartMeterById,
  createSmartMeter,
  updateSmartMeter,
  deleteSmartMeter,
};
