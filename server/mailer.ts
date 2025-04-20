import nodemailer from "nodemailer";

// Configure nodemailer
const EMAIL_USER = process.env.EMAIL_USER || "authotp247@gmail.com";
const EMAIL_PASS = process.env.EMAIL_PASS || "yrbh sahp dqup yaoe";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error setting up email transporter:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

/**
 * General purpose email sending function
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html: string
) {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send verification email with OTP
 */
export async function sendVerificationEmail(email: string, otp: string) {
  const subject = "ইমেইল ভেরিফিকেশন - সেভিংস অ্যাপ";
  const text = `আপনার ভেরিফিকেশন কোড হলো: ${otp}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #6366f1;">সেভিংস অ্যাপ ইমেইল ভেরিফিকেশন</h2>
      <p>আপনার অ্যাকাউন্ট ভেরিফাই করতে নিচের কোড ব্যবহার করুন:</p>
      <div style="background-color: #f3f4f6; padding: 15px; font-size: 20px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
        ${otp}
      </div>
      <p>এই কোড ১০ মিনিট পর্যন্ত বৈধ থাকবে।</p>
      <p>আপনি যদি এই ইমেইল অনুরোধ না করে থাকেন, তাহলে এটি উপেক্ষা করুন।</p>
      <p>ধন্যবাদ,<br/>সেভিংস অ্যাপ টিম</p>
    </div>
  `;

  return sendEmail(email, subject, text, html);
}
