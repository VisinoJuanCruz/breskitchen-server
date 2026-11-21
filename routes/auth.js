
const express = require("express");

const {
    checkAuth,
    login,
    logout,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/check-auth", checkAuth);

router.post("/login", login);

router.post("/logout", logout);

module.exports = router;
