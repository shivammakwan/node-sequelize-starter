const fs = require("fs");
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
      const checkIfUserExists = await db
        .userDatabase()
        .checkIfUserExists(info.email);

      if (checkIfUserExists.length > 0) {
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
        .readFileSync("./src/utils/emailtemplate/welcome.html", "utf8")
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
        data: null,
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

      if (loginDetails[0].isActive != 1 || loginDetails[0].isDeleted != 0) {
        console.log(loginDetails[0].isActive, loginDetails[0].isDeleted);
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
        firstName: loginDetails[0].firstName,
        lastName: loginDetails[0].lastName,
        email: loginDetails[0].email,
        isAdmin: loginDetails[0].isAdmin,
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
  async getUserProfile(user) {
    try {
      const userProfile = await db.userDatabase().getUser(user.email);

      const userDetails = {
        firstName: userProfile[0].firstName,
        lastName: userProfile[0].lastName,
        email: userProfile[0].email,
        isAdmin: userProfile[0].isAdmin,
        isEmailVerified: userProfile[0].isEmailVerified,
        isActive: userProfile[0].isActive,
        isDeleted: userProfile[0].isDeleted,
      };
      return {
        status: statusCode.success,
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
}

module.exports = {
  userService: function () {
    return new UserService();
  },
};
