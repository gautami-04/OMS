const PlannedOutage = require("../models/PlannedOutage");
const Consumer = require("../models/Consumer");
const { getAffectedConsumers } = require("./consumerImpactController");

const getReliabilityData = async () => {
  const [outages, totalConsumers] = await Promise.all([
    PlannedOutage.find(),
    Consumer.countDocuments(),
  ]);

  let affectedConsumerInterruptions = 0;
  let totalInterruptionDurationHours = 0;
  let outageCount = 0;

  for (const outage of outages) {
    const startTime = new Date(outage.startTime);
    const endTime = new Date(outage.endTime);
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      continue;
    }

    const affectedConsumers = await getAffectedConsumers(outage);

    if (!affectedConsumers) {
      continue;
    }

    outageCount += 1;
    affectedConsumerInterruptions += affectedConsumers.length;
    totalInterruptionDurationHours +=
      affectedConsumers.length * durationHours;
  }

  return {
    totalConsumers,
    affectedConsumerInterruptions,
    outageCount,
    totalInterruptionDurationHours,
    saidi:
      totalConsumers > 0
        ? totalInterruptionDurationHours / totalConsumers
        : 0,
    saifi:
      totalConsumers > 0
        ? affectedConsumerInterruptions / totalConsumers
        : 0,
  };
};

const getSaidi = async (req, res) => {
  try {
    const reliability = await getReliabilityData();

    res.status(200).json({
      saidi: reliability.saidi,
      totalConsumers: reliability.totalConsumers,
      affectedConsumerInterruptions: reliability.affectedConsumerInterruptions,
      outageCount: reliability.outageCount,
      totalInterruptionDurationHours:
        reliability.totalInterruptionDurationHours,
    });
  } catch (error) {
    console.error("Get SAIDI error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getSaifi = async (req, res) => {
  try {
    const reliability = await getReliabilityData();

    res.status(200).json({
      saifi: reliability.saifi,
      totalConsumers: reliability.totalConsumers,
      affectedConsumerInterruptions: reliability.affectedConsumerInterruptions,
      outageCount: reliability.outageCount,
    });
  } catch (error) {
    console.error("Get SAIFI error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSaidi,
  getSaifi,
};