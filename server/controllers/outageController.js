const PlannedOutage = require("../models/PlannedOutage");

const getOutages = async (req, res) => {
  try {
    const outages = await PlannedOutage.find()
      .populate("feeder")
      .populate("transformer");

    res.status(200).json(outages);
  } catch (error) {
    console.error("Get outages error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const createOutage = async (req, res) => {
  try {
    const {
      title,
      description,
      feeder,
      transformer,
      startTime,
      endTime,
      status,
    } = req.body;

    const outage = await PlannedOutage.create({
      title,
      description,
      feeder,
      transformer,
      startTime,
      endTime,
      status,
    });

    req.app.get("io").emit("outage:changed", {
      type: "created",
      outageId: outage._id,
    });

    res.status(201).json(outage);
  } catch (error) {
    console.error("Create outage error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateOutage = async (req, res) => {
  try {
    const outage = await PlannedOutage.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!outage) {
      return res.status(404).json({
        message: "Outage not found",
      });
    }

    req.app.get("io").emit("outage:changed", {
      type: "updated",
      outageId: outage._id,
    });

    res.status(200).json(outage);
  } catch (error) {
    console.error("Update outage error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteOutage = async (req, res) => {
  try {
    const outage = await PlannedOutage.findByIdAndDelete(req.params.id);

    if (!outage) {
      return res.status(404).json({
        message: "Outage not found",
      });
    }

    req.app.get("io").emit("outage:changed", {
      type: "deleted",
      outageId: outage._id,
    });

    res.status(200).json({
      message: "Outage deleted successfully",
    });
  } catch (error) {
    console.error("Delete outage error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getOutages,
  createOutage,
  updateOutage,
  deleteOutage,
};