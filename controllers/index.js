const models = require("../models");
const bcrypt = require("bcrypt");
const joi = require("joi");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

async function getAllUsers() {
  try {
    let users = await models.user.findAll({
      include: [
        { model: models.options, as: "options", through: models.user_options },
      ],
    });
    return {
      status: 200,
      body: { status: true, message: "All users", data: users },
    };
  } catch (err) {
    console.log(err);
  }
  return { status: 500, body: { status: false, message: "Internal Error" } };
}

async function createUser(req) {
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    address: joi.string().required(),
    dob: joi.date().required(),
    password: joi.string().required(),
    sni: joi.string().required(),
  });

  const validation = schema.validate({
    name: req.name,
    email: req.email,
    dob: req.dob,
    address: req.address,
    password: req.password,
    sni: req.sni,
  });

  if (validation.error) {
    return {
      status: 422,
      body: { status: false, message: validation.error.details[0].message },
    };
  }
  if (req.sni.length !== 16) {
    return {
      status: 422,
      body: { status: false, message: "SNI number must be 16 digit" },
    };
  }
  try {
    let emailExist = await models.user.findOne({ where: { email: req.email } });
    if (emailExist) {
      return {
        status: 409,
        body: { status: false, message: "Email Already Exist" },
      };
    }
    let sniExist = await models.user.findOne({ where: { sni: req.sni } });
    if (sniExist) {
      return {
        status: 409,
        body: { status: false, message: "SNI Number Already Exist" },
      };
    }

    await models.user.create({
      name: req.name,
      email: req.email,
      dob: req.dob,
      address: req.address,
      password: bcrypt.hashSync(req.password, bcrypt.genSaltSync(10)),
      sni: req.sni,
      role: "user",
    });

    return {
      status: 201,
      body: { status: true, message: "Account Created Successfully" },
    };
  } catch (err) {
    console.log(err);
    return { status: 500, body: { status: false, message: "Internal Error" } };
  }
}

async function loginUser(req) {
  try {
    let user = await models.user.findOne({ where: { email: req.email } });
    if (!user) {
      return {
        status: 404,
        body: { status: false, message: "Invalid Email or password" },
      };
    }

    let validPassword = await bcrypt.compare(req.password, user.password);
    if (!validPassword) {
      return {
        status: 404,
        body: { status: false, message: "Invalid Email or password" },
      };
    }

    let token = jwt.sign({ id: user.id }, process.env.TOKEN_SECRET);
    return {
      status: 200,
      body: {
        status: true,
        message: "Authenticated Successfully",
        user: user,
        token: token,
      },
    };
  } catch (err) {
    console.log(err);
    return { status: 500, body: { status: false, message: "Internal Error" } };
  }
}

module.exports = { createUser, getAllUsers, loginUser };
