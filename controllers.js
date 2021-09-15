const Raffle = require("./models/Raffle");
const Ticket = require("./models/Ticket");

const createRaffle = async (req, res) => {
  try {
    const { name, from, to } = req.body
    if (!data.name || !data.from || !data.to) {
      res.status(422).json({ error: "Missing values in the body" });
      return;
    }
    if (data.to < data.from) {
      res.status(422).json({ error: "Invalid range" });
      return;
    }
    const raffle = await Raffle.create(data);
    createTickets(data.from, data.to, raffle);
    res.status(201).json({ raffle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createTickets = async (from, to, raffle) => {
  try {
    for (let i = from; i <= to; i++) {
      Ticket.create({
        number: i,
        raffle,
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
        const tickets = await Ticket.find({ raffle: raffles[i]._id });
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
    let tickets = await Ticket.find({ raffle: raffleId }, { number: 1, available: 1 });
    raffle._doc["tickets"] = tickets;
    res.status(200).json({ raffle });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const buyTicket = async (req, res) => {
  try {
    const raffleId = req.params.raffleId;
    const { number, email, name, phone } = req.body
    
    if (!number || !email || !name || !phone) {
      res.status(422).json({ error: "Missing values in the body" });
      return;
    }
    
    let ticket = await Ticket.findOne({ number: req.body.number, raffle: raffleId });
    if (!ticket) {
      res.status(404).json({ error: "Ticket not found" });
      return;
    }
    
    if (ticket.available) {
      const ticket = await updateTicketWithBuyer(ticket, email, name, phone)
      res.status(200).json({ ticket });
    } else {
      res.status(409).json({ error: "Ticket not available" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateTicketWithBuyer = (ticket, email, name, phone) => {
  return await Ticket.findOneAndUpdate(
    { _id: ticket._id },
    {
      available: false,
      buyer: {
        email,
        name,
        phone,
      },
    },
    { new: true }
  );
}

const setWinner = async (req, res) => {
  try {
    const raffleId = req.params.id;
    const raffle = await Raffle.findOne({ _id: raffleId });
    if (raffle.closed) {
      res.status(409).json({ error: "Raffle is already closed" });
    } else {
      const tickets = await Ticket.find({ raffle: raffleId, available: false });
      if (tickets.length > 0) {
        const pos = Math.floor(Math.random() * tickets.length);
        await Raffle.findOneAndUpdate(
          { _id: tickets[pos].raffle },
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
