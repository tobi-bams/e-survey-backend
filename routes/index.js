const express = require("express");
const { createUser, getAllUsers, loginUser } = require("../controllers");
const {
  createQuestion,
  getAllQuestions,
  submitResponse,
  userQuestions,
  adminQuestions,
  editQuestion,
  deleteQuestion,
} = require("../controllers/question");
const auth = require("../verifyToken");

const router = express.Router();

router.get("/get-users", async (req, res) => {
  const response = await getAllUsers();
  res.status(response.status).json(response.body);
});

router.post("/signup", async (req, res) => {
  const newUser = await createUser(req.body);
  res.status(newUser.status).json(newUser.body);
});

router.post("/login", async (req, res) => {
  const login = await loginUser(req.body);
  res.status(login.status).json(login.body);
});

router.post("/question", auth, async (req, res) => {
  const question = await createQuestion(req);
  res.status(question.status).json(question.body);
});

router.get("/GetAllQuestions", async (req, res) => {
  const questions = await getAllQuestions();
  res.status(questions.status).json(questions.body);
});

router.post("/submit-response", auth, async (req, res) => {
  const response = await submitResponse(req);
  res.status(response.status).json(response.body);
});

router.get("/user-questions", auth, async (req, res) => {
  const questions = await userQuestions(req);
  res.status(questions.status).json(questions.body);
});

router.get("/admin-questions", auth, async (req, res) => {
  const questions = await adminQuestions(req);
  res.status(questions.status).json(questions.body);
});

router.put("/question", auth, async (req, res) => {
  const question = await editQuestion(req);
  res.status(question.status).json(question.body);
});

router.delete("/question/:id", auth, async (req, res) => {
  const question = await deleteQuestion(req);
  res.status(question.status).json(question.body);
});

module.exports = router;
