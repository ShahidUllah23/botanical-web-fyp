const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Validate the required parameters
  if (!options.email || !options.subject || !options.message) {
    throw new Error("Missing required parameters: email, subject, or message.");
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, // Make sure this is a numeric value (e.g., 587 for SMTP or 465 for SMTPS)
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error.message);
    // You can choose to throw the error again if you want the caller to handle it
    // throw error;
  }
};

module.exports = sendEmail;
