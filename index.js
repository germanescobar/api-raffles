const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const routes = require("./routes");

app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://localhost:27017/api-raffles",
  console.log("connected succesfully")
);

app.use(routes);

app.listen("3001", () => console.log("Server started..."));
