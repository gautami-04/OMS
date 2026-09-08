const PlannedOutage = require("../models/PlannedOutage");
const Feeder = require("../models/Feeder");
const Transformer = require("../models/Transformer");
const Consumer = require("../models/Consumer");

const getConsumerImpact = async (req, res) => {
  try {
    const { outageId } = req.params;

    // Find the outage and populate its related grid assets
    const outage = await PlannedOutage.findById(outageId)
      .populate("feeder")
      .populate("transformer");

    if (!outage) {
      return res.status(404).json({
        message: "Outage not found",
      });
    }

    /*
      RESTORED OUTAGE
      ----------------
      A restored outage is historical and should not have
      any CURRENT consumer impact.
    */
    if (outage.status === "Restored") {
      return res.status(200).json({
        outage: {
          id: outage._id,
          title: outage.title,
          status: outage.status,
          startTime: outage.startTime,
          endTime: outage.endTime,
        },

        consumerCount: 0,

        affectedConsumers: [],

        affectedFeeders: [],

        affectedTransformers: [],
      });
    }

    let affectedFeeders = [];
    let affectedTransformers = [];
    let affectedConsumers = [];

    /*
      CASE 1:
      Outage affects a specific transformer.
    */
    if (outage.transformer) {
      const transformer = outage.transformer;

      affectedTransformers = [transformer];

      // Find consumers connected to this transformer
      affectedConsumers = await Consumer.find({
        transformer: transformer._id,
      }).populate("transformer");
    }

    /*
      CASE 2:
      Outage affects an entire feeder.
      Find every transformer belonging to that feeder,
      then every consumer connected to those transformers.
    */
    else if (outage.feeder) {
      const feeder = outage.feeder;

      affectedFeeders = [feeder];

      // Find all transformers belonging to this feeder
      affectedTransformers = await Transformer.find({
        feeder: feeder._id,
      }).populate("feeder");

      const transformerIds = affectedTransformers.map(
        (transformer) => transformer._id
      );

      // Find all consumers connected to those transformers
      affectedConsumers = await Consumer.find({
        transformer: { $in: transformerIds },
      }).populate("transformer");
    }

    /*
      If a transformer outage was provided,
      identify its feeder as well.
    */
    if (outage.transformer && affectedTransformers.length > 0) {
      const transformer = affectedTransformers[0];

      if (transformer.feeder) {
        const feederId =
          transformer.feeder._id || transformer.feeder;

        const feeder = await Feeder.findById(feederId);

        if (feeder) {
          affectedFeeders = [feeder];
        }
      }
    }

    res.status(200).json({
      outage: {
        id: outage._id,
        title: outage.title,
        status: outage.status,
        startTime: outage.startTime,
        endTime: outage.endTime,
      },

      consumerCount: affectedConsumers.length,

      affectedConsumers: affectedConsumers.map(
        (consumer) => ({
          id: consumer._id,
          name: consumer.name,
          consumerNumber: consumer.consumerNumber,

          transformer: consumer.transformer
            ? {
                id: consumer.transformer._id,
                name: consumer.transformer.name,
                code: consumer.transformer.code,
              }
            : null,

          location: consumer.location,
        })
      ),

      affectedFeeders: affectedFeeders.map(
        (feeder) => ({
          id: feeder._id,
          name: feeder.name,
          code: feeder.code,
        })
      ),

      affectedTransformers: affectedTransformers.map(
        (transformer) => ({
          id: transformer._id,
          name: transformer.name,
          code: transformer.code,

          feeder: transformer.feeder
            ? {
                id:
                  transformer.feeder._id ||
                  transformer.feeder,
                name: transformer.feeder.name,
                code: transformer.feeder.code,
              }
            : null,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Consumer impact error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getConsumerImpact,
};