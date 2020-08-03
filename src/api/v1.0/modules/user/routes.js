const router = require("express").Router();
const api = require("./controller");
const auth = require("../../../../utils/authentication");

// user registration
router.post("/register", auth.decryptRequest, api.registration);

router.get("/", auth.decryptRequest, api.getUsers);

module.exports = router;