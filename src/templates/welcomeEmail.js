const welcomeEmail = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body{
          font-family: Arial, sans-serif;
          background:#f5f5f5;
          padding:30px;
        }

        .container{
          max-width:600px;
          margin:auto;
          background:white;
          padding:30px;
          border-radius:10px;
        }

        h1{
          color:#2E7D32;
        }

        .button{
          display:inline-block;
          background:#2E7D32;
          color:white;
          text-decoration:none;
          padding:12px 20px;
          border-radius:5px;
        }

        .footer{
          margin-top:30px;
          color:#777;
          font-size:14px;
        }
      </style>
    </head>

    <body>

      <div class="container">

        <h1>🚗 Welcome to EV Charging App</h1>

        <p>Hello <strong>${name}</strong>,</p>

        <p>
          Your account has been created successfully.
        </p>

        <p>
          You can now:
        </p>

        <ul>
          <li>⚡ Book charging stations</li>
          <li>❤️ Save favourite stations</li>
          <li>⭐ Write reviews</li>
          <li>👤 Manage your profile</li>
        </ul>

        <p>
          We are excited to have you with us.
        </p>

        <a
          href="http://localhost:5000"
          class="button"
        >
          Visit EV Charging App
        </a>

        <div class="footer">

          <p>Thank you,</p>

          <strong>EV Charging Team</strong>

        </div>

      </div>

    </body>
    </html>
  `;
};

module.exports = welcomeEmail;