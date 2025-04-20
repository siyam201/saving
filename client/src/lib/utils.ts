import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format number as Bengali currency
export function formatBengaliCurrency(amount: number): string {
  return `৳ ${amount.toLocaleString('bn-BD')}`;
}

// Format date to Bengali format
export function formatBengaliDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Convert English numbers to Bengali
export function convertToBengaliNumber(num: number): string {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => {
    if (digit >= '0' && digit <= '9') {
      return bengaliNumerals[parseInt(digit)];
    }
    return digit;
  }).join('');
}

// Calculate progress percentage
export function calculateProgressPercentage(current: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.round(percentage), 100);
}
