const pool = require("./db");

async function testDatabase() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Database Connected Successfully!");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);
  } finally {
    pool.end();
  }
}

testDatabase();