const config = require("../../config");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const fs = require("fs");
const { errorHandler } = require("./error");
const AWS = require("aws-sdk");

/**
 * Function for Encrypting the data
 * @param {*} data (data to encrypt)
 * @param {*} return (encrypted data)
 */
function encryptData(data) {
  if (config.bodyEncryption) {
    var dataString = JSON.stringify(data);
    var response = CryptoJS.AES.encrypt(dataString, config.cryptokey);
    return { encResponse: response.toString() };
  }
  return data;
}

/**
 * Function for decrypting the data
 * @param {*} data (data to decrypt)
 * @param {*} return (decrypt data)
 */
function decryptData(data) {
  if (config.bodyEncryption) {
    var decrypted = CryptoJS.AES.decrypt(data, config.cryptokey);
    if (decrypted) {
      var userinfo = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      return userinfo;
    } else {
      return { userinfo: { error: "Please send proper token" } };
    }
  }
  return data;
}

/**
 * Function for Encrypting the password
 * @param {*} data (data to encrypt)
 * @param {*} return (encrypted data)
 */
function encryptPassword(data) {
  var response = CryptoJS.AES.encrypt(data, config.tokenKey);
  return response.toString();
}

/**
 * Function for decrypting the password
 * @param {*} data (data to decrypt)
 * @param {*} return (decrypt data)
 */
function decryptPassword(data) {
  var decrypted = CryptoJS.AES.decrypt(data, config.tokenKey);
  if (decrypted) {
    var userinfo = decrypted.toString(CryptoJS.enc.Utf8);
    return userinfo;
  } else {
    return { userinfo: { error: "Please send proper token" } };
  }
}

/**
 * Function for encryting the userId with session
 * @param {*} data (data to encrypt)
 * @param {*} return (encrypted data)
 */
async function tokenEncrypt(data) {
  var token = await jwt.sign({ data: data }, config.tokenKey, {
    expiresIn: 24 * 60 * 60,
  }); // Expires in 1 day
  return token;
}

/**
 * Function for decrypting the userId with session
 * @param {*} data (data to decrypt)
 * @param {*} return (decrypted data)
 */
async function tokenDecrypt(data) {
  try {
    const decode = await jwt.verify(data, config.tokenKey);
    return decode;
  } catch (error) {
    return error;
  }
}

/**
 * Function for creating response
 * @param {*} data (status, data, token)
 * @param {*} return (encrypted data)
 */
function responseGenerator(statusCode, message, data = "") {
  var details = {
    statusCode: statusCode,
    message: message,
    result: data,
  };

  if (config.bodyEncryption) {
    return encryptData(details);
  } else {
    return details;
  }
}

/**
 * Function for sending email
 * @param {*} data (to, sub)
 * @param {*} return (decrypted data)
 */
async function sendEmail(to, subject, message) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.SMTPEmailAddress,
      pass: config.SMTPPassword,
    },
  });

  var mailOptions = {
    from: "developers@gmail.com",
    to: to,
    subject: subject,
    html: message,
  };

  try {
    const smsDetails = await transporter.sendMail(mailOptions);
    return smsDetails;
  } catch (error) {
    errorHandler(error);
  }
}

/**
 * Function to randomly generate string
 * param
 * return (err, result)
 */
function generateRandomString(callback) {
  var referralCode = randomstring.generate({
    length: 9,
    charset: "alphanumeric",
    capitalization: "uppercase",
  });
  callback(referralCode);
}

/* 
  Generate random string of specific size, 
  which used  for generating random password in create user by admin.
*/
function randomPasswordGenerater(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Function for Uploading file
 * @param {*} data (image information)
 * @param {*} return (uploaded information)
 */
async function uploadFile(fileInfo) {
  try {
    const fileType = fileInfo.fileType;
    const fileName = `${fileInfo.fileName}.${fileType}`;
    var base64 = fileInfo.base64.split(";base64,")[1];
    var fileBuffer = new Buffer.from(base64, "base64");
    if (!fs.existsSync("./public/" + fileInfo.pathInfo)) {
      await fs.mkdirSync("./public/" + fileInfo.pathInfo, { recursive: true });
    }
    await fs.writeFileSync(
      "./public/" + fileInfo.pathInfo + fileName,
      fileBuffer,
      "utf8"
    );
    return { fileName: fileName };
  } catch (e) {
    throw e;
  }
}

/**
 * Function for AWSs3Connection
 * @param {*} data (image information)
 * @param {*} return (uploaded information)
 */
const AWSs3Connection = new AWS.S3({
  accessKeyId: config.awsAccessKey,
  secretAccessKey: config.awsSecretAccessKey,
});

/**
 * Function for Uploading file to s3 bucket
 * @param {*} data (image information)
 * @param {*} return (uploaded information)
 */
async function s3FileUpload(postDataObj) {
  try {
    const fileType = postDataObj.fileType;
    const fileName = `${postDataObj.fileName}.${fileType}`;
    var base64 = postDataObj.base64.split(";base64,")[1];
    var base64Data = new Buffer.from(base64, "base64");
    var contentType = "application/octet-stream";
    if (fileType == "pdf") contentType = "application/pdf";
    if (
      fileType == "png" ||
      fileType == "jpg" ||
      fileType == "gif" ||
      fileType == "jpeg" ||
      fileType == "webp" ||
      fileType == "bmp"
    )
      contentType = `image/${fileType}`;
    if (fileType == "svg") contentType = "image/svg+xml";
    const params = {
      Bucket: `${config.awsBucket}/user-profile`,
      Key: `${postDataObj.key}.${fileType}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: contentType,
    };
    const s3BucketFileLocation = await AWSs3Connection.upload(params).promise();
    return { location: s3BucketFileLocation, fileName: imageName };
  } catch (error) {
    throw error;
  }
}

/**
 * Function for deleting file from s3 bucket
 * @param {*} data (image information)
 * @param {*} return (uploaded information)
 */
async function s3RemoveFile(postDataObj) {
  try {
    const params = {
      Bucket: config.awsBucket,
      Delete: {
        Objects: [
          {
            Key: `${postDataObj.key}`,
          },
        ],
        Quiet: false,
      },
    };

    const s3BucketImageLocation = await AWSs3Connection.deleteObjects(
      params
    ).promise();
    return s3BucketImageLocation;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  encryptData,
  decryptData,
  encryptPassword,
  decryptPassword,
  tokenEncrypt,
  tokenDecrypt,
  responseGenerator,
  sendEmail,
  generateRandomString,
  randomPasswordGenerater,
  uploadFile,
  s3FileUpload,
  s3RemoveFile,
};
