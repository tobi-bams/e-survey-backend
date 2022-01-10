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

  if (options.length === 0) {
    return {
      status: 422,
      body: { status: false, message: "Options cannot be empty" },
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
    if (userResponse.length === 0) {
      return {
        status: 422,
        body: {
          status: false,
          message: "Please answer all the questions",
        },
      };
    }
    let submittedResponse = await models.user_options.findOne({
      where: { userId: user.id },
    });

    if (submittedResponse) {
      return {
        status: 400,
        body: {
          status: false,
          message: "You cannot retake the survey",
        },
      };
    }
    let selectedOptions = [];
    for (let i = 0; i < userResponse.length; i++) {
      if (userResponse[i].selectedOption !== null) {
        selectedOptions.push({
          userId: userId,
          optionId: userResponse[i].selectedOption,
        });
      }
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

async function userQuestions(req) {
  try {
    let user = await models.user.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: models.options,
          as: "options",
          through: models.user_options,
        },
      ],
    });

    if (user.role !== "user") {
      return {
        status: 401,
        body: {
          status: false,
          message: "You are not authorized to view this page",
        },
      };
    }
    let question = await models.questions.findAll({
      include: [models.options],
    });

    let data = [];
    for (let i = 0; i < question.length; i++) {
      let tempOption = null;
      for (let y = 0; y < user.options.length; y++) {
        if (question[i].id === user.options[y].questionId) {
          tempOption = { selectedOption: user.options[y].id };
        }
      }
      if (tempOption === null) {
        data.push({
          question: question[i],
          selectedOption: null,
          answered: false,
        });
      } else {
        data.push({
          question: question[i],
          selectedOption: tempOption.selectedOption,
          answered: true,
        });
      }
    }
    return {
      status: 200,
      body: { status: true, message: "All Questions", data: data },
    };
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      body: { status: false, message: "Internal Server Error" },
    };
  }
}

async function adminQuestions(req) {
  try {
    let user = await models.user.findOne({ where: { id: req.user.id } });
    if (user.role !== "admin") {
      return {
        status: 401,
        body: {
          status: false,
          message: "You are not authorized to get this questions",
        },
      };
    }

    let questions = await models.questions.findAll({
      include: [models.options],
    });
    let allOptions = await models.options.findAll({
      include: [
        { model: models.user, as: "users", through: models.user_options },
      ],
    });
    let questionCount = {};
    let optionCount = {};
    allOptions.forEach((option) => {
      optionCount[option.id] = option.users.length;
      if (questionCount[option.questionId]) {
        questionCount[option.questionId] =
          questionCount[option.questionId] + option.users.length;
      } else {
        questionCount[option.questionId] = option.users.length;
      }
    });
    const optionHandler = (options) => {
      let summarizedOption = [];
      options.forEach((option) => {
        summarizedOption.push({
          id: option.id,
          option: option.text,
          votes: optionCount[option.id],
        });
      });
      return summarizedOption;
    };
    let data = [];
    questions.forEach((question) => {
      data.push({
        id: question.id,
        question: question.text,
        response: questionCount[question.id],
        options: optionHandler(question.options),
      });
    });
    return {
      status: 200,
      body: { status: true, message: "Admin Questions", data: data },
    };
  } catch (err) {
    console.log(err);
    return {
      status: 500,
      body: { status: false, message: "Internal Server Error" },
    };
  }
}

async function editQuestion(req) {
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

  if (options.length === 0) {
    return {
      status: 422,
      body: { status: false, message: "Options cannot be empty" },
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

    let updateQuestion = await models.questions.findOne({
      where: { id: req.body.id },
    });

    await updateQuestion.update({ text: question }, { transaction: t });

    let newOptionArray = [];
    for (let i = 0; i < options.length; i++) {
      newOptionArray.push({
        id: options[i].id,
        text: options[i].option,
      });
    }
    for (let option of newOptionArray) {
      let updateOption = await models.options.findOne({
        where: { id: option.id },
        include: [
          { model: models.user, as: "users", through: models.user_options },
        ],
      });

      if (updateOption.users.length > 0) {
        await t.rollback();
        return {
          status: 400,
          body: {
            status: false,
            message: "You cannot Edit a question that has been answered",
          },
        };
      }
      await updateOption.update({ text: option.text }, { transaction: t });
    }
    await t.commit();
    return {
      status: 201,
      body: {
        status: true,
        message: "Question Updated Successfully",
      },
    };
  } catch (err) {
    await t.rollback();
    console.log(err);
    return { status: 500, body: { status: false, message: "Internal Error" } };
  }
}

module.exports = {
  createQuestion,
  getAllQuestions,
  submitResponse,
  userQuestions,
  adminQuestions,
  editQuestion,
};
