const express = require("express");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const routes = require("./routes");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

app.use("/", routes);
app.use((req, res) => {
  res.status(404).json({ status: false, message: "Route not found" });
});

let PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(" We are good here");
  try {
    await sequelize.authenticate();
    console.log("Database Connected Successfully");
  } catch (err) {
    console.log(err);
  }
});
