import { sendEmail } from './mailer';
import { storage } from './storage';
import { User } from '@shared/schema';

/**
 * Send a notification about the user's current balance
 */
export async function sendBalanceNotification(user: User) {
  // Create notification in database
  await storage.createNotification({
    userId: user.id,
    title: "ব্যালেন্স আপডেট",
    message: `আপনার বর্তমান ব্যালেন্স: ${user.balance} টাকা`,
    createdAt: new Date().toISOString(),
    type: 'balance',
  });

  // Send email notification
  const emailHtml = `
    <div style="font-family: 'Hind Siliguri', Arial, sans-serif; color: #333;">
      <h2 style="color: #6366f1;">সেভিংস অ্যাপ - ব্যালেন্স আপডেট</h2>
      <p>প্রিয় ${user.name},</p>
      <p>আপনার অ্যাকাউন্টের বর্তমান ব্যালেন্স: <strong>${user.balance} টাকা</strong></p>
      <p>ধন্যবাদান্তে,<br/>সেভিংস অ্যাপ টিম</p>
    </div>
  `;

  await sendEmail(
    user.email,
    "সেভিংস অ্যাপ - ব্যালেন্স আপডেট",
    `আপনার বর্তমান ব্যালেন্স: ${user.balance} টাকা`,
    emailHtml
  );
}

/**
 * Send a notification when a savings goal is achieved
 */
export async function sendGoalAchievedNotification(user: User, goalName: string) {
  // Create notification in database
  await storage.createNotification({
    userId: user.id,
    title: "সেভিংস গোল অর্জিত!",
    message: `আপনি আপনার "${goalName}" সেভিংস গোল অর্জন করেছেন! অভিনন্দন!`,
    createdAt: new Date().toISOString(),
    type: 'goal_achieved',
  });

  // Send email notification
  const emailHtml = `
    <div style="font-family: 'Hind Siliguri', Arial, sans-serif; color: #333;">
      <h2 style="color: #6366f1;">সেভিংস অ্যাপ - সেভিংস লক্ষ্য অর্জিত!</h2>
      <p>প্রিয় ${user.name},</p>
      <p>অভিনন্দন! আপনি আপনার "${goalName}" সেভিংস লক্ষ্য অর্জন করেছেন!</p>
      <div style="background-color: #f3f4f6; padding: 15px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 6px;">
        🎉 আপনার পরিশ্রম সফল হয়েছে! 🎉
      </div>
      <p>আপনার পরবর্তী আর্থিক লক্ষ্য সেট করতে অ্যাপে লগইন করুন।</p>
      <p>ধন্যবাদান্তে,<br/>সেভিংস অ্যাপ টিম</p>
    </div>
  `;

  await sendEmail(
    user.email,
    "সেভিংস অ্যাপ - সেভিংস লক্ষ্য অর্জিত!",
    `অভিনন্দন! আপনি আপনার "${goalName}" সেভিংস লক্ষ্য অর্জন করেছেন!`,
    emailHtml
  );
}

/**
 * Send a reminder notification for periodic savings
 */
export async function sendSavingsReminderNotification(user: User, planName: string, amount: number) {
  // Create notification in database
  await storage.createNotification({
    userId: user.id,
    title: "সেভিংস রিমাইন্ডার",
    message: `আজ আপনার "${planName}" প্ল্যানে ${amount} টাকা জমা দেওয়ার দিন।`,
    createdAt: new Date().toISOString(),
    type: 'reminder',
  });

  // Send email notification
  const emailHtml = `
    <div style="font-family: 'Hind Siliguri', Arial, sans-serif; color: #333;">
      <h2 style="color: #6366f1;">সেভিংস অ্যাপ - সেভিংস রিমাইন্ডার</h2>
      <p>প্রিয় ${user.name},</p>
      <p>আজ আপনার "${planName}" সেভিংস প্ল্যানে ${amount} টাকা জমা দেওয়ার দিন।</p>
      <p>নিয়মিত সঞ্চয় আপনার আর্থিক লক্ষ্য পূরণে সহায়তা করবে।</p>
      <p>ধন্যবাদান্তে,<br/>সেভিংস অ্যাপ টিম</p>
    </div>
  `;

  await sendEmail(
    user.email,
    "সেভিংস অ্যাপ - সেভিংস রিমাইন্ডার",
    `আজ আপনার "${planName}" প্ল্যানে ${amount} টাকা জমা দেওয়ার দিন।`,
    emailHtml
  );
}

/**
 * Send a transaction notification
 */
export async function sendTransactionNotification(user: User, amount: number, type: string) {
  const transactionType = type === 'deposit' ? 'জমা' : type === 'add_funds' ? 'ফান্ড যোগ' : 'উত্তোলন';
  
  // Create notification in database
  await storage.createNotification({
    userId: user.id,
    title: "লেনদেন সম্পন্ন",
    message: `আপনার অ্যাকাউন্টে ${amount} টাকা ${transactionType} করা হয়েছে।`,
    createdAt: new Date().toISOString(),
    type: 'transaction',
  });

  // Send email notification
  const emailHtml = `
    <div style="font-family: 'Hind Siliguri', Arial, sans-serif; color: #333;">
      <h2 style="color: #6366f1;">সেভিংস অ্যাপ - লেনদেন বিজ্ঞপ্তি</h2>
      <p>প্রিয় ${user.name},</p>
      <p>আপনার অ্যাকাউন্টে ${amount} টাকা ${transactionType} করা হয়েছে।</p>
      <p>বর্তমান ব্যালেন্স: ${user.balance} টাকা</p>
      <p>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</p>
      <p>ধন্যবাদান্তে,<br/>সেভিংস অ্যাপ টিম</p>
    </div>
  `;

  await sendEmail(
    user.email,
    "সেভিংস অ্যাপ - লেনদেন বিজ্ঞপ্তি",
    `আপনার অ্যাকাউন্টে ${amount} টাকা ${transactionType} করা হয়েছে। বর্তমান ব্যালেন্স: ${user.balance} টাকা`,
    emailHtml
  );
}