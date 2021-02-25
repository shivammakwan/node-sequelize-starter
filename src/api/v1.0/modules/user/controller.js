const object = require("./user");
const functions = require("../../../../utils/functions");

const controller = {
  //User Registration API
  registration: async (req, res, next) => {
    try {
      const registrationDetails = await object
        .userService()
        .registration(res.locals.requestedData);
      res.send(
        functions.responseGenerator(
          registrationDetails.statusCode,
          registrationDetails.message,
          registrationDetails.data
        )
      );
    } catch (error) {
      return next(error);
    }
  },
  //User Login API
  login: async (req, res, next) => {
    try {
      const user = await object.userService().login(res.locals.requestedData);
      res.send(
        functions.responseGenerator(user.statusCode, user.message, user.data)
      );
    } catch (error) {
      return next(error);
    }
  },
  //Get User List API
  getUserProfile: async (req, res, next) => {
    try {
      const users = await object
        .userService()
        .getUserProfile(res.locals.tokenInfo);
      res.send(
        functions.responseGenerator(users.statusCode, users.message, users.data)
      );
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = controller;
