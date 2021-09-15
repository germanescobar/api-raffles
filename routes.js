const express = require("express");
const controller = require("./controllers");

const app = express.Router();

app.post("/raffles", controller.createRaffle);
app.get("/raffles", controller.listRaffles);
app.get("/raffles/:id", controller.getRaffle);
app.post("/raffles/:raffleId/tickets", controller.buyTicket);
app.post("/raffles/:id/play", controller.setWinner);

module.exports = app;
