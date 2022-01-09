const express = require("express");
const { createUser, getAllUsers } = require("../controllers");

const router = express.Router();

router.get("/get-users", async (req, res) => {
  const response = await getAllUsers();
  res.status(response.status).json(response.body);
});

router.post("/signup", async (req, res) => {
  const newUser = await createUser(req.body);
  res.status(newUser.status).json(newUser.body);
});

module.exports = router;
