const Raffle = require("./models/Raffle");
const Ticket = require("./models/Ticket");

const createRaffle = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      from: req.body.from,
      to: req.body.to,
    };
    if (!data.name || !data.from || !data.to) {
      res.status(422).json({ error: "Missing values in the body" });
    }
    if (data.to < data.from) {
      res.status(422).json({ error: "Invalid range" });
    }
    const raffle = await Raffle.create(data);
    createTickets(data.from, data.to, raffle._id);
    res.status(201).json({ raffle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createTickets = async (from, to, raffleId) => {
  try {
    for (let i = from; i <= to; i++) {
      Ticket.create({
        number: i,
        raffleId: raffleId,
      });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const listRaffles = async (req, res) => {
  try {
    let raffles = await Raffle.find();
    for (let i = 0; i < raffles.length; i++) {
      if (!raffles[i].closed) {
        const tickets = await Ticket.find({ raffleId: raffles[i]._id });
        let available = 0;
        tickets.forEach((ticket) => {
          if (ticket.available) {
            available = available + 1;
          }
        });
        raffles[i] = {
          name: raffles[i].name,
          closed: raffles[i].closed,
          ticketsAvailable: available,
        };
      } else {
        const winner = await Ticket.findById(raffles[i].winner);
        raffles[i] = {
          name: raffles[i].name,
          closed: raffles[i].closed,
          winner: {
            ticket: winner.number,
            email: winner.buyer.email,
            name: winner.buyer.name,
            phone: winner.buyer.phone,
          },
        };
      }
    }
    res.status(200).json(raffles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getRaffle = async (req, res) => {
  try {
    const raffleId = req.params.id;
    let raffle = await Raffle.findOne({ _id: raffleId });
    let tickets = await Ticket.find({ raffleId }, { number: 1, available: 1 });
    raffle._doc["tickets"] = tickets;
    res.status(200).json({ raffle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const buyTicket = async (req, res) => {
  try {
    const raffleId = req.params.raffleId;
    if (
      !req.body.number ||
      !req.body.email ||
      !req.body.name ||
      !req.body.phone
    ) {
      res.status(422).json({ error: "Missing values in the body" });
    }
    let ticket = await Ticket.findOne({ number: req.body.number, raffleId });
    if (ticket) {
      if (ticket.available) {
        ticket = await Ticket.findOneAndUpdate(
          { _id: ticket._id },
          {
            available: false,
            buyer: {
              email: req.body.email,
              name: req.body.name,
              phone: req.body.phone,
            },
          },
          { new: true }
        );
        res.status(200).json({ ticket });
      } else {
        res.status(409).json({ error: "Ticket not available" });
      }
    } else {
      res.status(404).json({ error: "Ticket not found" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const setWinner = async (req, res) => {
  try {
    const raffleId = req.params.id;
    const raffle = await Raffle.findOne({ _id: raffleId });
    if (raffle.closed) {
      res.status(409).json({ error: "Raffle is already closed" });
    } else {
      const tickets = await Ticket.find({ raffleId, available: false });
      if (tickets.length > 0) {
        const pos = Math.floor(Math.random() * tickets.length);
        await Raffle.findOneAndUpdate(
          { _id: tickets[pos].raffleId },
          {
            closed: true,
            winner: tickets[pos]._id,
          }
        );
        res.status(200).json({
          awarded: true,
          number: tickets[pos].number,
          email: tickets[pos].buyer.email,
          name: tickets[pos].buyer.name,
          phone: tickets[pos].buyer.phone,
        });
      } else {
        res.status(200).json({ awarded: false });
      }
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { createRaffle, listRaffles, getRaffle, buyTicket, setWinner };
