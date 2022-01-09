const models = require("../models");
const bcrypt = require("bcrypt");
const joi = require("joi");

async function getAllUsers() {
  try {
    let users = await models.user.findAll();
    return {
      status: 200,
      body: { status: true, message: "All users", data: users },
    };
  } catch (err) {
    console.log(error);
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

module.exports = { createUser, getAllUsers };
