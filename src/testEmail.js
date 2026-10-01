require("dotenv").config();

const { sendEmail } = require("./utils/emailService");

// =======================
// Check Environment Variables
// =======================
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS Length:",
  process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : "Not Found"
);

(async () => {
  try {
    console.log("📧 Sending test email...");

    const sent = await sendEmail(
      process.env.EMAIL_USER,
      "EV Charging App Test",
      `
        <h2>🎉 Congratulations!</h2>
        <p>Your email service is working successfully.</p>
        <p>This email was sent from your Node.js EV Charging App.</p>
      `
    );

    if (sent) {
      console.log("✅ Email sent successfully.");
    } else {
      console.log("❌ Failed to send email.");
    }
  } catch (error) {
    console.error("❌ Test Error:", error);
  } finally {
    process.exit();
  }
})();