const pool = require("./db");

async function testDatabase() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("✅ Database Connected Successfully!");
    console.log("Current Time:", result.rows[0].now);
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);
  }
}

testDatabase();