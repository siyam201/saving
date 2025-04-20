import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess: (userId: number) => void;
}

export function RegisterForm({ onSwitchToLogin, onRegisterSuccess }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "অবৈধ ইনপুট",
        description: "সকল ক্ষেত্র পূরণ করুন",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "পাসওয়ার্ড মিলছে না",
        description: "পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড একই হতে হবে",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "দুর্বল পাসওয়ার্ড",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        name,
        email,
        password,
      });
      
      const data = await response.json();
      
      toast({
        title: "রেজিস্ট্রেশন সফল",
        description: "ইমেইলে পাঠানো OTP দিয়ে আপনার অ্যাকাউন্ট ভেরিফাই করুন",
      });
      
      // Redirect to OTP verification
      onRegisterSuccess(data.userId);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: error instanceof Error ? error.message : "রেজিস্ট্রেশন করা যায়নি, আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="registerName" className="block text-sm font-medium text-gray-700 font-bangla">
          আপনার নাম
        </label>
        <Input
          type="text"
          id="registerName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 font-bangla">
          ইমেইল
        </label>
        <Input
          type="email"
          id="registerEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 font-bangla">
          পাসওয়ার্ড
        </label>
        <Input
          type="password"
          id="registerPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="registerConfirmPassword" className="block text-sm font-medium text-gray-700 font-bangla">
          পাসওয়ার্ড নিশ্চিত করুন
        </label>
        <Input
          type="password"
          id="registerConfirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full font-bangla"
          disabled={isLoading}
        >
          {isLoading ? "রেজিস্ট্রেশন হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
        </Button>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 font-bangla">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-primary-600 hover:text-primary-500 font-bangla"
          >
            লগইন করুন
          </button>
        </p>
      </div>
    </form>
  );
}
