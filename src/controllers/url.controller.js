const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

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

    const referrer = req.get("referer") || "direct";
    const parser = new UAParser(req.headers["user-agent"]);
    const deviceType = parser.getDevice().type || "desktop";
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo?.country || "unknown";

    const originalUrl = await urlService.getOriginalUrl(
      code,
      referrer,
      deviceType,
      country,
    );

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
