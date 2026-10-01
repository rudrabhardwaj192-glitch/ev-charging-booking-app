const pool = require("./db");

const MAX_RETRIES = 10;
const RETRY_DELAY = 3000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testDatabase() {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await pool.query("SELECT NOW()");

      console.log("✅ Database Connected Successfully!");
      console.log("Current Time:", result.rows[0].now);

      return true;
    } catch (error) {
      console.log(
        `❌ Database not ready (Attempt ${attempt}/${MAX_RETRIES})`
      );

      if (attempt === MAX_RETRIES) {
        console.error("❌ Unable to connect to PostgreSQL.");
        console.error(error.message);
        process.exit(1);
      }

      await sleep(RETRY_DELAY);
    }
  }
}

module.exports = testDatabase;