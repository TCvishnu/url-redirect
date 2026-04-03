const autocannon = require("autocannon");
const pool = require("../src/db/postgres");

async function getRandomCodes(limit = 1000) {
  const res = await pool.query(
    `SELECT short_code FROM urls ORDER BY RANDOM() LIMIT $1`,
    [limit],
  );
  return res.rows.map((r) => r.short_code);
}

async function run() {
  const codes = await getRandomCodes(100);

  let i = 0;

  const instance = autocannon({
    url: "http://localhost:3000",
    connections: 100,
    duration: 20,
    requests: [
      {
        method: "GET",
        setupRequest: (req) => {
          const code = codes[i % codes.length];
          i++;

          return {
            ...req,
            path: `/${code}`,
          };
        },
      },
    ],
  });

  autocannon.track(instance, { renderProgressBar: true });

  instance.on("done", (result) => {
    console.log("\n=== Benchmark Results ===");

    console.log("Requests/sec:", result.requests.average);
    console.log("Latency avg (ms):", result.latency.average);
    console.log("Latency p99 (ms):", result.latency.p99);

    console.log("Total requests:", result.requests.total);
    console.log("Total errors:", result.errors);
    console.log("Total time (s):", result.duration);

    console.log("\nThroughput (bytes/sec):", result.throughput.average);
  });
}

run();
