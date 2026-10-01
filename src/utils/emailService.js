const nodemailer = require("nodemailer");

// =======================
// Email Transporter
// =======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// =======================
// Verify SMTP Connection
// =======================
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to send emails.");
  }
});

// =======================
// Send Email
// =======================
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"EV Charging App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
};