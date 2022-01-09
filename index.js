const express = require("express");
const dotenv = require("dotenv");
const { sequelize } = require("./models");
const routes = require("./routes");

const app = express();
app.use(express.json());
dotenv.config();

app.use("/", routes);
app.use((req, res) => {
  res.status(404).json({ status: false, message: "Route not found" });
});

app.listen(5000, async () => {
  console.log(" We are good here");
  try {
    await sequelize.authenticate();
    console.log("Database Connected Successfully");
  } catch (err) {
    console.log(err);
  }
});
