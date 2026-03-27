const urlService = require("../services/url.service");

async function shortenUrl(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "url is required" });
    }

    const result = await urlService.shortenUrl(url);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function redirectUrl(req, res) {
  try {
    const { code } = req.params;

    const originalUrl = await urlService.getOriginalUrl(code);

    if (!originalUrl) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.redirect(301, originalUrl);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  shortenUrl,
  redirectUrl,
};
