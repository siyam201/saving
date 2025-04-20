import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { SavingsGoal } from "@shared/schema";

interface SavingsPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsPlanModal({ isOpen, onClose }: SavingsPlanModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("সাপ্তাহিক");
  const [dayOfWeek, setDayOfWeek] = useState<string>("সোমবার");
  const [dayOfMonth, setDayOfMonth] = useState<string>("1");
  const [savingsGoalId, setSavingsGoalId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch savings goals
  const { data: savingsGoals } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setFrequency("সাপ্তাহিক");
      setDayOfWeek("সোমবার");
      setDayOfMonth("1");
      setSavingsGoalId("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "অবৈধ পরিমাণ",
        description: "দয়া করে একটি বৈধ পরিমাণ প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Convert Bengali frequency to English
      const frequencyMap: Record<string, string> = {
        "দৈনিক": "daily",
        "সাপ্তাহিক": "weekly",
        "মাসিক": "monthly"
      };
      
      await apiRequest("POST", "/api/savings-plans", {
        amount: parseFloat(amount),
        frequency: frequencyMap[frequency] || "weekly",
        dayOfWeek: frequency === "সাপ্তাহিক" ? dayOfWeek : null,
        dayOfMonth: frequency === "মাসিক" ? parseInt(dayOfMonth) : null,
        savingsGoalId: savingsGoalId === "none" ? null : parseInt(savingsGoalId),
      });
      
      toast({
        title: "সেভিংস প্ল্যান তৈরি সফল",
        description: `${frequency} সেভিংস প্ল্যান সফলভাবে তৈরি করা হয়েছে`,
        variant: "default",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-plans"] });
      
      onClose();
    } catch (error) {
      console.error("Error creating savings plan:", error);
      toast({
        title: "প্ল্যান তৈরি ব্যর্থ",
        description: "দুঃখিত, একটি ত্রুটি ঘটেছে। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="নতুন সেভিংস প্ল্যান তৈরি করুন"
      description="নিয়মিত সেভিংস করতে আপনার সেভিংস প্ল্যান তৈরি করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="planAmount" className="block text-sm font-medium font-bangla">
            সেভিংস পরিমাণ (টাকা)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-500">৳</span>
            </div>
            <Input
              id="planAmount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-7"
              disabled={isSubmitting}
              min="1"
              step="any"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="frequency" className="block text-sm font-medium font-bangla">
            ফ্রিকোয়েন্সি
          </label>
          <Select
            value={frequency}
            onValueChange={setFrequency}
            disabled={isSubmitting}
          >
            <SelectTrigger id="frequency" className="font-bangla">
              <SelectValue placeholder="ফ্রিকোয়েন্সি নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="দৈনিক" className="font-bangla">দৈনিক</SelectItem>
              <SelectItem value="সাপ্তাহিক" className="font-bangla">সাপ্তাহিক</SelectItem>
              <SelectItem value="মাসিক" className="font-bangla">মাসিক</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {frequency === "সাপ্তাহিক" && (
          <div className="space-y-2">
            <label htmlFor="dayOfWeek" className="block text-sm font-medium font-bangla">
              সাপ্তাহিক দিন
            </label>
            <Select
              value={dayOfWeek}
              onValueChange={setDayOfWeek}
              disabled={isSubmitting}
            >
              <SelectTrigger id="dayOfWeek" className="font-bangla">
                <SelectValue placeholder="সাপ্তাহিক দিন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="সোমবার" className="font-bangla">সোমবার</SelectItem>
                <SelectItem value="মঙ্গলবার" className="font-bangla">মঙ্গলবার</SelectItem>
                <SelectItem value="বুধবার" className="font-bangla">বুধবার</SelectItem>
                <SelectItem value="বৃহস্পতিবার" className="font-bangla">বৃহস্পতিবার</SelectItem>
                <SelectItem value="শুক্রবার" className="font-bangla">শুক্রবার</SelectItem>
                <SelectItem value="শনিবার" className="font-bangla">শনিবার</SelectItem>
                <SelectItem value="রবিবার" className="font-bangla">রবিবার</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {frequency === "মাসিক" && (
          <div className="space-y-2">
            <label htmlFor="dayOfMonth" className="block text-sm font-medium font-bangla">
              মাসের দিন
            </label>
            <Select
              value={dayOfMonth}
              onValueChange={setDayOfMonth}
              disabled={isSubmitting}
            >
              <SelectTrigger id="dayOfMonth" className="font-bangla">
                <SelectValue placeholder="মাসের দিন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(28)].map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()} className="font-bangla">
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="planGoal" className="block text-sm font-medium font-bangla">
            সেভিংস টার্গেট (ঐচ্ছিক)
          </label>
          <Select
            value={savingsGoalId}
            onValueChange={setSavingsGoalId}
            disabled={isSubmitting}
          >
            <SelectTrigger id="planGoal" className="font-bangla">
              <SelectValue placeholder="টার্গেট নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="font-bangla">টার্গেট ছাড়া সাধারণ সেভিংস</SelectItem>
              {savingsGoals?.map((goal) => (
                <SelectItem key={goal.id} value={String(goal.id)} className="font-bangla">
                  {goal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-bangla"
          >
            বাতিল
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="font-bangla"
          >
            {isSubmitting ? "প্রক্রিয়াধীন..." : "প্ল্যান তৈরি করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
