import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { SavingsGoal } from "@shared/schema";

interface DepositFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositFundsModal({ isOpen, onClose }: DepositFundsModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [savingsGoalId, setSavingsGoalId] = useState<string>("");
  const [note, setNote] = useState<string>("");
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
      setSavingsGoalId("");
      setNote("");
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
      await apiRequest("POST", "/api/user/deposit", {
        amount: parseFloat(amount),
        savingsGoalId: savingsGoalId || null,
        note: note.trim() || null,
      });
      
      toast({
        title: "ডিপোজিট সফল",
        description: `${amount} টাকা সফলভাবে আপনার সেভিংসে যোগ করা হয়েছে`,
        variant: "default",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      
      onClose();
    } catch (error) {
      console.error("Error making deposit:", error);
      toast({
        title: "ডিপোজিট ব্যর্থ",
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
      title="টাকা জমা দিন"
      description="আপনার সেভিংস অ্যাকাউন্টে টাকা জমা দিতে নিচের ফর্মটি পূরণ করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="depositAmount" className="block text-sm font-medium font-bangla">
            পরিমাণ (টাকা)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-500">৳</span>
            </div>
            <Input
              id="depositAmount"
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
          <label htmlFor="savingsGoal" className="block text-sm font-medium font-bangla">
            সেভিংস টার্গেট (ঐচ্ছিক)
          </label>
          <Select
            value={savingsGoalId}
            onValueChange={setSavingsGoalId}
            disabled={isSubmitting}
          >
            <SelectTrigger id="savingsGoal" className="font-bangla">
              <SelectValue placeholder="টার্গেট নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" className="font-bangla">টার্গেট ছাড়া সাধারণ সেভিংস</SelectItem>
              {savingsGoals?.map((goal) => (
                <SelectItem key={goal.id} value={String(goal.id)} className="font-bangla">
                  {goal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="note" className="block text-sm font-medium font-bangla">
            নোট (ঐচ্ছিক)
          </label>
          <Textarea
            id="note"
            placeholder="কোন নোট থাকলে লিখুন..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
            variant="success"
            disabled={isSubmitting}
            className="font-bangla"
          >
            {isSubmitting ? "প্রক্রিয়াধীন..." : "জমা দিন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
