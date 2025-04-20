import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface OtpVerificationProps {
  userId: number;
  onVerificationSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function OtpVerification({ userId, onVerificationSuccess, onSwitchToLogin }: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "অবৈধ OTP",
        description: "দয়া করে 6 অংকের OTP প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      await apiRequest("POST", "/api/auth/verify-otp", {
        userId,
        otp,
      });
      
      toast({
        title: "ভেরিফিকেশন সফল",
        description: "আপনার ইমেইল সফলভাবে ভেরিফাই করা হয়েছে",
      });
      
      onVerificationSuccess();
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "ভেরিফিকেশন ব্যর্থ",
        description: error instanceof Error ? error.message : "অবৈধ বা মেয়াদউত্তীর্ণ OTP",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    
    try {
      await apiRequest("POST", "/api/auth/resend-otp", {
        userId,
      });
      
      toast({
        title: "OTP পুনরায় পাঠানো হয়েছে",
        description: "দয়া করে আপনার ইমেইল চেক করুন",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "OTP পুনরায় পাঠানো ব্যর্থ",
        description: error instanceof Error ? error.message : "OTP আবার পাঠানো যায়নি। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 font-bangla">ইমেইল ভেরিফিকেশন</h2>
        <p className="mt-2 text-sm text-gray-600 font-bangla">
          আপনার ইমেইলে পাঠানো ৬ ডিজিটের কোডটি প্রবেশ করান
        </p>
      </div>
      
      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={isVerifying}
          render={({ slots }) => (
            <InputOTPGroup>
              {slots.map((slot, index) => (
                <InputOTPSlot key={index} {...slot} />
              ))}
            </InputOTPGroup>
          )}
        />
      </div>
      
      <div>
        <Button
          onClick={handleVerify}
          className="w-full font-bangla"
          disabled={isVerifying || otp.length !== 6}
        >
          {isVerifying ? "ভেরিফাই হচ্ছে..." : "ভেরিফাই করুন"}
        </Button>
      </div>
      
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={handleResendOtp}
          className="font-medium text-primary-600 hover:text-primary-500 font-bangla"
          disabled={isResending}
        >
          {isResending ? "পাঠানো হচ্ছে..." : "কোড পাননি? আবার পাঠান"}
        </button>
      </div>
      
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-gray-600 hover:text-gray-500 font-bangla"
        >
          লগইন পেজে ফিরে যান
        </button>
      </div>
    </div>
  );
}
