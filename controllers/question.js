const models = require("../models");
const joi = require("joi");
const { includes } = require("lodash");
async function createQuestion(req) {
  const schema = joi.object({
    question: joi.string().required(),
    options: joi.array().required(),
  });

  let question = req.body.question;
  let options = req.body.options;
  const validation = schema.validate({
    question: question,
    options: options,
  });

  if (validation.error) {
    return {
      status: 422,
      body: { status: false, message: validation.error.details[0].message },
    };
  }
  const t = await models.sequelize.transaction();
  try {
    let creator = await models.user.findOne(
      { where: { id: req.user.id } },
      { transaction: t }
    );
    if (creator.role !== "admin") {
      return {
        status: 401,
        body: { status: false, message: "You cannot create a question" },
      };
    }

    let createdQuestion = await models.questions.create(
      { text: question },
      { transaction: t }
    );

    let newOptionArray = [];
    for (let i = 0; i < options.length; i++) {
      newOptionArray.push({ text: options[i], questionId: createdQuestion.id });
    }
    await models.options.bulkCreate(newOptionArray, { transaction: t });
    await t.commit();
    return {
      status: 201,
      body: {
        status: true,
        message: "Question Created Successfully",
      },
    };
  } catch (err) {
    await t.rollback();
    console.log(err);
    return { status: 500, body: { status: false, message: "Internal Error" } };
  }
}

async function getAllQuestions() {
  try {
    let questions = await models.questions.findAll({
      include: [models.options],
    });
    return {
      status: 200,
      body: { message: "All Questions Created", data: questions },
    };
  } catch (err) {
    console.log(err);
    return { status: 500, body: { status: false, message: "Internal Error" } };
  }
}

module.exports = { createQuestion, getAllQuestions };
