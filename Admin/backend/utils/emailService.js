const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

const sendContactReply = async (to, name, subject, originalMessage, reply) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"APNA DECORATION" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">APNA DECORATION - Reply to Your Message</h2>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for contacting us. Here is our response to your inquiry:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${reply}</p>
          </div>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #6b7280; font-size: 14px;"><strong>Your Original Message:</strong></p>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 3px solid #7c3aed; margin: 10px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${originalMessage}</p>
          </div>
          
          <p style="margin-top: 30px;">If you have any further questions, feel free to contact us again.</p>
          
          <p>Best regards,<br><strong>APNA DECORATION Team</strong></p>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendContactReply };
