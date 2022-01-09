const models = require("../models");
const joi = require("joi");

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

async function submitResponse(req) {
  let userId = req.user.id;
  let userResponse = req.body.response;

  const schema = joi.object({
    response: joi.array().required(),
  });

  const validation = schema.validate({
    response: userResponse,
  });

  if (validation.error) {
    return {
      status: 422,
      body: { status: false, message: validation.error.details[0].message },
    };
  }

  try {
    let user = await models.user.findOne(
      { where: { id: req.user.id } },
      { include: [models.options] }
    );
    if (user.role !== "user") {
      return {
        status: 401,
        body: {
          status: false,
          message: "You are not authorized to view this page",
        },
      };
    }
    let selectedOptions = [];
    for (let i = 0; i < userResponse.length; i++) {
      selectedOptions.push({
        userId: userId,
        optionId: userResponse[i].selectedResponse,
      });
    }
    let trial = await models.user_options.bulkCreate(selectedOptions);
    console.log(trial);
    return {
      status: 201,
      body: { status: true, message: "Response Recorded Successfully" },
    };
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      body: { status: false, message: "Internal Server Error" },
    };
  }
}

// async function userQuestions(req) {
//   try {
//     let user = await models.user.findOne(
//       { where: { id: req.user.id } },
//       { include: [models.options] }
//     );
//     if (user.role !== "user") {
//       return {
//         status: 401,
//         body: {
//           status: false,
//           message: "You are not authorized to view this page",
//         },
//       };
//     }
//     let question = await models.questions.findAll({
//       include: [models.options],
//     });

//     let data = [];
//     for (let i = 0; i < question.length; i++) {

//     }
//   } catch (err) {
//     console.log(err);
//     return {
//       status: 500,
//       body: { status: false, message: "Internal Server Error" },
//     };
//   }
// }

module.exports = { createQuestion, getAllQuestions, submitResponse };
