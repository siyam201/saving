import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavingsGoalModal({ isOpen, onClose }: SavingsGoalModalProps) {
  const [name, setName] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Set default target date to 3 months from now
  useEffect(() => {
    if (isOpen && !targetDate) {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      setTargetDate(date.toISOString().split('T')[0]);
    }
  }, [isOpen, targetDate]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setTargetAmount("");
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      setTargetDate(date.toISOString().split('T')[0]);
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "অবৈধ নাম",
        description: "দয়া করে একটি বৈধ টার্গেটের নাম প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }
    
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      toast({
        title: "অবৈধ পরিমাণ",
        description: "দয়া করে একটি বৈধ টার্গেট পরিমাণ প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }
    
    if (!targetDate) {
      toast({
        title: "অবৈধ তারিখ",
        description: "দয়া করে একটি বৈধ টার্গেট তারিখ প্রবেশ করান",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/savings-goals", {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        targetDate: new Date(targetDate).toISOString(),
        description: description.trim() || null,
      });
      
      toast({
        title: "সেভিংস টার্গেট তৈরি সফল",
        description: `${name} টার্গেট সফলভাবে তৈরি করা হয়েছে`,
        variant: "default",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      
      onClose();
    } catch (error) {
      console.error("Error creating savings goal:", error);
      toast({
        title: "টার্গেট তৈরি ব্যর্থ",
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
      title="নতুন সেভিংস টার্গেট সেট করুন"
      description="আপনার সেভিংস টার্গেট সেট করতে এবং ট্র্যাক করতে নিচের ফর্মটি পূরণ করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="goalName" className="block text-sm font-medium font-bangla">
            টার্গেটের নাম
          </label>
          <Input
            id="goalName"
            type="text"
            placeholder="উদাহরণঃ নতুন মোটরসাইকেল"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="font-bangla"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="goalAmount" className="block text-sm font-medium font-bangla">
            টার্গেট পরিমাণ (টাকা)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-500">৳</span>
            </div>
            <Input
              id="goalAmount"
              type="number"
              placeholder="0.00"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="pl-7"
              disabled={isSubmitting}
              min="1"
              step="any"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="targetDate" className="block text-sm font-medium font-bangla">
            টার্গেট তারিখ
          </label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="goalDescription" className="block text-sm font-medium font-bangla">
            বিবরণ (ঐচ্ছিক)
          </label>
          <Textarea
            id="goalDescription"
            placeholder="আপনার টার্গেট সম্পর্কে কিছু লিখুন..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="font-bangla"
            rows={2}
          />
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
            variant="warning"
            disabled={isSubmitting}
            className="font-bangla"
          >
            {isSubmitting ? "প্রক্রিয়াধীন..." : "টার্গেট সেট করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
