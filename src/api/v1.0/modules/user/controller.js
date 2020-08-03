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
  //Get User List API
  getUsers: async (req, res, next) => {
    try {
      const users = await object
        .userService()
        .getUsers(res.locals.requestedData);
      res.send(
        functions.responseGenerator(users.statusCode, users.message, users.data)
      );
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = controller;
