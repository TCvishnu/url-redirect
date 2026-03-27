const pool = require("../db/postgres");
const encoder = require("./encoder");
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

async function getOriginalUrl(shortCode) {
  // logic goes here later
  return shortCode + ":hehehe";
}

module.exports = {
  shortenUrl,
  getOriginalUrl,
};
