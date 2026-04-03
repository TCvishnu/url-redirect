const express = require("express");
const router = express.Router();

const urlController = require("../controllers/url.controller");

router.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

router.post("/shorten", urlController.shortenUrl);
router.get("/:code", urlController.redirectUrl);

module.exports = router;
