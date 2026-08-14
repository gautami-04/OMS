const Ticket = require("../models/Ticket");

const createTicket = async (req, res) => {
  try {
    const { outage, fieldEngineer, description, status } = req.body;

    const ticket = await Ticket.create({
      outage,
      fieldEngineer,
      description,
      status,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error("Create ticket error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("Update ticket error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  createTicket,
  updateTicket,
};