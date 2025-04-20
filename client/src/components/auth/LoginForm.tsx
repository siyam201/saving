import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { loginUser } from "@/lib/auth";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "অবৈধ ইনপুট",
        description: "ইমেইল এবং পাসওয়ার্ড প্রয়োজনীয়",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      
      const data = await response.json();
      
      // Store token and user info
      loginUser(data.token, data.user, rememberMe);
      
      toast({
        title: "লগইন সফল",
        description: "আপনি সফলভাবে লগইন করেছেন",
      });
      
      // Reload to trigger the auth state change
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "লগইন ব্যর্থ",
        description: error instanceof Error ? error.message : "ইমেইল বা পাসওয়ার্ড ভুল",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 font-bangla">
          ইমেইল
        </label>
        <Input
          type="email"
          id="loginEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 font-bangla">
          পাসওয়ার্ড
        </label>
        <Input
          type="password"
          id="loginPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember_me"
            name="remember_me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700 font-bangla">
            মনে রাখুন
          </label>
        </div>
        
        <div className="text-sm">
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500 font-bangla">
            পাসওয়ার্ড ভুলে গেছেন?
          </a>
        </div>
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full font-bangla"
          disabled={isLoading}
        >
          {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
        </Button>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 font-bangla">
          অ্যাকাউন্ট নেই?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-primary-600 hover:text-primary-500 font-bangla"
          >
            রেজিস্ট্রেশন করুন
          </button>
        </p>
      </div>
    </form>
  );
}
