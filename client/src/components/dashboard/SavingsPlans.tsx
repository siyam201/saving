import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { SavingsPlanModal } from "@/components/modals/SavingsPlanModal";
import { Calendar, Edit, Plus, Trash } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ui/modal";

export function SavingsPlans() {
  const [showSavingsPlanModal, setShowSavingsPlanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch savings plans
  const { data: savingsPlans, isLoading } = useQuery({
    queryKey: ["/api/savings-plans"],
  });

  const handleDeleteClick = (planId: number) => {
    setSelectedPlanId(planId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlanId) return;
    
    try {
      await apiRequest("DELETE", `/api/savings-plans/${selectedPlanId}`);
      
      toast({
        title: "প্ল্যান বাতিল করা হয়েছে",
        description: "সেভিংস প্ল্যান সফলভাবে বাতিল করা হয়েছে",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/savings-plans"] });
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting savings plan:", error);
      toast({
        title: "প্ল্যান বাতিল ব্যর্থ",
        description: "দুঃখিত, একটি ত্রুটি ঘটেছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  };
  
  // Function to get Bengali frequency name
  const getFrequencyName = (frequency: string) => {
    const frequencyMap: Record<string, string> = {
      "daily": "প্রতি দিন",
      "weekly": "প্রতি সপ্তাহে",
      "monthly": "প্রতি মাসে"
    };
    return frequencyMap[frequency] || frequency;
  };

  // Function to get schedule display text
  const getScheduleText = (plan: any) => {
    if (plan.frequency === "daily") {
      return "প্রতিদিন";
    } else if (plan.frequency === "weekly" && plan.dayOfWeek) {
      return `সপ্তাহের প্রতি ${plan.dayOfWeek}`;
    } else if (plan.frequency === "monthly" && plan.dayOfMonth) {
      return `প্রতি মাসের ${plan.dayOfMonth} তারিখে`;
    }
    return "";
  };

  return (
    <div className="mt-8">
      <div className="mb-5 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 font-bangla">আপনার সেভিংস প্ল্যান</h3>
        <Button 
          onClick={() => setShowSavingsPlanModal(true)}
          className="font-bangla"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" /> নতুন প্ল্যান
        </Button>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 font-bangla">লোড হচ্ছে...</div>
        ) : savingsPlans && savingsPlans.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {savingsPlans.map((plan: any) => (
              <li key={plan.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-primary-600 truncate font-bangla">
                      {getFrequencyName(plan.frequency)}
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <Badge variant="success" className="font-bangla">
                        {plan.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <div className="sm:flex">
                      <div className="mr-6 flex items-center text-sm text-gray-700 font-bangla">
                        <span className="mr-1.5 flex-shrink-0 text-gray-400">৳</span>
                        {plan.amount.toLocaleString()}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-700 sm:mt-0 font-bangla">
                        <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        {getScheduleText(plan)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 ml-2"
                        onClick={() => handleDeleteClick(plan.id)}
                      >
                        <Trash className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500 font-bangla">
            কোন সেভিংস প্ল্যান নেই। নতুন প্ল্যান তৈরি করুন।
          </div>
        )}
      </div>
      
      <SavingsPlanModal 
        isOpen={showSavingsPlanModal} 
        onClose={() => setShowSavingsPlanModal(false)} 
      />
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="প্ল্যান বাতিল করুন"
        description="আপনি কি নিশ্চিত যে আপনি এই সেভিংস প্ল্যানটি বাতিল করতে চান?"
        confirmText="হ্যাঁ, বাতিল করুন"
        cancelText="না, রাখুন"
        variant="destructive"
      />
    </div>
  );
}
