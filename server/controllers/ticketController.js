const Ticket = require("../models/Ticket");

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: "outage",
        populate: [{ path: "feeder" }, { path: "transformer" }],
      })
      .populate("fieldEngineer", "name email role");

    res.status(200).json(tickets);
  } catch (error) {
    console.error("Get tickets error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

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

const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
};