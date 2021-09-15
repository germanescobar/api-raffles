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
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Raffle",
    required: true,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
