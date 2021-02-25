const Joi = require("joi");

function validateRegister(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().min(5).required(),
    lastName: Joi.string().min(5).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string().min(3).max(15).required(),
  });
  const { error, value, warning } = schema.validate(res.locals.requestedData);
  if (error) throw error;
  res.locals.requestedData = value;
  next();
}

function validateLogin(req, res, next) {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string().required(),
  });
  const { error, value, warning } = schema.validate(res.locals.requestedData);
  if (error) throw error;
  res.locals.requestedData = value;
  next();
}
module.exports = {
  validateRegister,
  validateLogin,
};
