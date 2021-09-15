const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
  number: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  buyer: {
    email: { type: String, default: "" },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  raffleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "raffles",
    required: true,
  },
});

const Ticket = mongoose.model("Tickets", ticketSchema);

module.exports = Ticket;
