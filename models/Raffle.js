const mongoose = require("mongoose");

const rafflesSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  from: {
    type: Number,
    default: 0,
  },
  to: {
    type: Number,
    required: false,
  },
  closed: {
    type: Boolean,
    default: false,
  },
  winner: {
    type: String,
    default: "",
  },
});

const Raffle = mongoose.model("Raffle", rafflesSchema);
module.exports = Raffle;
