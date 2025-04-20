import nodemailer from "nodemailer";

// For development, we'll use a mock implementation that logs to console
// In production, this would connect to a real SMTP server
let transporter: nodemailer.Transporter;

// Configure nodemailer
if (process.env.NODE_ENV === "production") {
  // Use real SMTP service in production
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Boolean(process.env.SMTP_SECURE) || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // In development, just log emails to console
  transporter = {
    sendMail: async (options) => {
      console.log("=============== EMAIL SENT ===============");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Text:", options.text);
      console.log("HTML:", options.html);
      console.log("==========================================");
      return { messageId: "mock-message-id" };
    },
  } as unknown as nodemailer.Transporter;
}

/**
 * Send verification email with OTP
 */
export async function sendVerificationEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "no-reply@savings-app.com",
    to: email,
    subject: "ইমেইল ভেরিফিকেশন - সেভিংস অ্যাপ",
    text: `আপনার ভেরিফিকেশন কোড হলো: ${otp}`,
    html: `
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
    `,
  };

  await transporter.sendMail(mailOptions);
}
