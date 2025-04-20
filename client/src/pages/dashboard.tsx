import { Header } from "@/components/dashboard/Header";
import { Overview } from "@/components/dashboard/Overview";
import { SavingsPlans } from "@/components/dashboard/SavingsPlans";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  // Fetch user profile with associated data
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["/api/user/profile"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center font-bangla">
          <div className="text-xl font-medium text-gray-700 mb-2">লোড হচ্ছে...</div>
          <div className="text-sm text-gray-500">আপনার ড্যাশবোর্ড লোড হচ্ছে, অপেক্ষা করুন</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center font-bangla">
          <div className="text-xl font-medium text-red-600 mb-2">ত্রুটি ঘটেছে</div>
          <div className="text-sm text-gray-500">ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Overview Section */}
        <div className="px-4 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-800 font-bangla">আপনার ফাইনান্সিয়াল ওভারভিউ</h2>
          <p className="mt-2 text-sm text-gray-600 font-bangla">আপনার সেভিংস এবং অর্থ সম্পর্কিত তথ্য এখানে দেখুন</p>
        </div>
        
        {/* Balance Cards */}
        <Overview 
          balance={profile?.balance || 0} 
          totalSavings={profile?.totalSavings || 0} 
          savingsGoals={profile?.savingsGoals || []}
        />
        
        {/* Savings Plans */}
        <SavingsPlans />
        
        {/* Transaction History */}
        <TransactionHistory />
      </main>
    </div>
  );
}
