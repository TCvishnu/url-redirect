const autocannon = require("autocannon");

let counter = 0;

autocannon({
  url: "http://localhost:3000",
  connections: 50,
  duration: 20,
  requests: [
    {
      method: "POST",
      path: "/shorten",
      headers: {
        "Content-Type": "application/json",
      },
      setupRequest: (req) => {
        const body = JSON.stringify({
          url: `https://example.com/${counter++}`,
        });

        return {
          ...req,
          body,
        };
      },
    },
  ],
});
