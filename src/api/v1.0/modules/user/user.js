const model = require("../../../../models");
const User = model.users;
const db = require("./db");
const statusCode = require("../../../../utils/statusCode");
const message = require("../../../../utils/message");
const functions = require("../../../../utils/functions");
const config = require("../../../../../config");

class UserService {
  /**
   * Add User
   * @param  {user details}
   * @return {Success/Fail}
   */
  async registration(info) {
    try {
      if (
        !validator.isEmail(info.email) ||
        validator.isEmpty(info.password) ||
        validator.isEmpty(info.fullName) ||
        validator.isEmpty(info.mobileNumber)
      ) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.badRequest,
          data: null,
        };
      }

      const checkIfuserExists = await db.userDatabase().checkIfuserExists(info);

      if (checkIfuserExists.length > 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.duplicateDetails,
          data: null,
        };
      }

      info.password = functions.encryptPassword(info.password);

      const userRegistration = await db.userDatabase().userRegistration(info);

      let token = await functions.tokenEncrypt(info.email);
      token = Buffer.from(token, "ascii").toString("hex");
      let emailMessage = fs
        .readFileSync("./common/emailtemplate/welcome.html", "utf8")
        .toString();
      emailMessage = emailMessage
        .replace("$fullname", info.firstName)
        .replace("$link", config.emailVerificationLink + token);

      functions.sendEmail(
        info.email,
        message.registrationEmailSubject,
        emailMessage
      );
      return {
        statusCode: statusCode.success,
        message: message.registration,
        data: userRegistration,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * API for user login
   * @param {*} req (email address & password)
   * @param {*} res (json with success/failure)
   */
  async login(info) {
    try {
      if (!validator.isEmail(info.email)) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }

      const loginDetails = await db.userDatabase().getUser(info.email);

      if (loginDetails.length <= 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }
      const password = functions.decryptPassword(loginDetails[0].password);
      if (password !== info.password) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.invalidLoginDetails,
          data: null,
        };
      }

      if (loginDetails[0].isActive !== 1 || loginDetails[0].isDeleted !== 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.accountDisable,
          data: null,
        };
      }

      if (loginDetails[0].isEmailVerified === 0) {
        throw {
          statusCode: statusCode.bad_request,
          message: message.emailVerify,
          data: null,
        };
      }

      const userDetails = {
        fullName: loginDetails[0].fullName,
        email: loginDetails[0].email,
        mobileNumber: loginDetails[0].mobileNumber,
      };

      const token = await functions.tokenEncrypt(userDetails);

      userDetails.token = token;

      return {
        statusCode: statusCode.success,
        message: message.success,
        data: userDetails,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }

  /**
   * Get Users
   * @param  {user details}
   * @return {Success/Fail}
   */
  async getUsers(info) {
    try {
      const users = await User.findAll();
      return {
        status: statusCode.success,
        message: message.success,
        data: users,
      };
    } catch (error) {
      throw {
        statusCode: error.statusCode,
        message: error.message,
        data: JSON.stringify(error),
      };
    }
  }
}

module.exports = {
  userService: function () {
    return new UserService();
  },
};
