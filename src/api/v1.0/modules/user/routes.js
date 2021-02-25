const router = require("express").Router();
const api = require("./controller");
const auth = require("../../../../utils/authentication");
const validate = require("./validator");

// user registration
router.post(
  "/register",
  auth.decryptRequest,
  validate.validateRegister,
  api.registration
);
router.post("/login", auth.decryptRequest, validate.validateLogin, api.login);

router.get("/profile", auth.validateToken, api.getUserProfile);

module.exports = router;