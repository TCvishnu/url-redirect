const pool = require("../db/postgres");
const queue = require("./click.queue");

const BATCH_SIZE = 1000;
const MAX_WAIT = 100; // ms

let timer = null;

async function processBatch() {
  if (queue.isEmpty()) return;

  const batch = [];

  for (let i = 0; i < BATCH_SIZE; i++) {
    const item = queue.dequeue();
    if (!item) break;
    batch.push(item);
  }

  if (batch.length === 0) return;

  const values = [];
  const placeholders = [];

  batch.forEach((item, i) => {
    const idx = i * 4;
    values.push(item.shortCode, item.country, item.deviceType, item.referrer);
    placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`);
  });

  try {
    await pool.query(
      `INSERT INTO clicks(short_code, country, device_type, referrer)
       VALUES ${placeholders.join(",")}`,
      values,
    );
  } catch (err) {
    console.error("Batch insert failed:", err);
  }
}

function enqueueClick(click) {
  queue.enqueue(click);

  if (queue.size >= BATCH_SIZE) {
    processBatch();
    return;
  }

  if (!timer) {
    timer = setTimeout(() => {
      processBatch();
      timer = null;
    }, MAX_WAIT);
  }
}

module.exports = {
  enqueueClick,
};
