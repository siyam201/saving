import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { OtpVerification } from "@/components/auth/OtpVerification";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isAuthenticated } from "@/lib/auth";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [activeView, setActiveView] = useState<"login" | "register" | "otp">("login");
  const [userId, setUserId] = useState<number | null>(null);
  const [location, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      setLocation("/dashboard");
    }
  }, [setLocation]);

  const handleRegisterSuccess = (newUserId: number) => {
    setUserId(newUserId);
    setActiveView("otp");
  };

  const handleVerificationSuccess = () => {
    setActiveView("login");
  };

  // Active tab value for login/register tabs
  const tabValue = activeView === "otp" ? "register" : activeView;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* App Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 font-bangla">সেভিংস অ্যাপ</h1>
          <p className="mt-2 text-gray-600 font-bangla">আপনার অর্থ সঞ্চয়ের সেরা সমাধান</p>
        </div>
        
        {/* Auth Tabs */}
        {activeView !== "otp" ? (
          <Tabs value={tabValue} onValueChange={(value) => setActiveView(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-bangla">লগইন</TabsTrigger>
              <TabsTrigger value="register" className="font-bangla">রেজিস্ট্রেশন</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onSwitchToRegister={() => setActiveView("register")} />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm 
                onSwitchToLogin={() => setActiveView("login")} 
                onRegisterSuccess={handleRegisterSuccess}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <OtpVerification 
            userId={userId!} 
            onVerificationSuccess={handleVerificationSuccess}
            onSwitchToLogin={() => setActiveView("login")}
          />
        )}
      </div>
    </div>
  );
}
