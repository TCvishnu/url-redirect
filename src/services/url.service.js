const pool = require("../db/postgres");
const redis = require("../db/redis");
const encoder = require("./encoder");

const { enqueueClick } = require("../click-logger/click.worker");

const BASE_URL = process.env.BASE_URL;

async function shortenUrl(originalUrl) {
  const oneWeekAfterToday = new Date();
  oneWeekAfterToday.setDate(oneWeekAfterToday.getDate() + 7);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const insertResult = await client.query(
      "INSERT INTO urls(original_url, expires_at) VALUES($1, $2) RETURNING id",
      [originalUrl, oneWeekAfterToday],
    );

    const { id } = insertResult.rows[0];

    const shortCode = encoder.encodeBase62(id);

    await client.query("UPDATE urls SET short_code = $1 WHERE id = $2", [
      shortCode,
      id,
    ]);

    await client.query("COMMIT");

    return {
      shortCode,
      shortUrl: `${BASE_URL}/${shortCode}`,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("DB Error:", e);

    return { error: e.message };
  } finally {
    client.release();
  }
}

async function getOriginalUrl(shortCode, referrer, deviceType, country) {
  const cached = await redis.get(shortCode);

  if (cached) {
    const parsed = JSON.parse(cached);

    enqueueClick({
      shortCode,
      country,
      deviceType,
      referrer,
      clickedAt: new Date(),
    });

    return parsed.original_url;
  }

  const result = await pool.query(
    `SELECT original_url, expires_at 
     FROM urls 
     WHERE short_code = $1`,
    [shortCode],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const { original_url, expires_at } = result.rows[0];

  if (expires_at && new Date(expires_at) < new Date()) {
    return null;
  }

  const ttlSeconds = expires_at
    ? Math.floor((new Date(expires_at) - new Date()) / 1000)
    : 60 * 60 * 24;

  await redis.set(shortCode, JSON.stringify({ original_url }), {
    EX: ttlSeconds > 0 ? ttlSeconds : 60,
  });

  enqueueClick({
    shortCode,
    country,
    deviceType,
    referrer,
    clickedAt: new Date(),
  });

  return original_url;
}

module.exports = {
  shortenUrl,
  getOriginalUrl,
};
