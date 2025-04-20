import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawFundsModal({ isOpen, onClose }: WithdrawFundsModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setReason("");
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
      await apiRequest("POST", "/api/user/withdraw", {
        amount: parseFloat(amount),
        reason: reason.trim() || null,
      });
      
      toast({
        title: "উত্তোলন সফল",
        description: `${amount} টাকা সফলভাবে উত্তোলন করা হয়েছে`,
        variant: "default",
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      
      onClose();
    } catch (error: any) {
      console.error("Error withdrawing funds:", error);
      
      // Show specific error message if provided from API
      const errorMessage = error.message || 
        "দুঃখিত, একটি ত্রুটি ঘটেছে। পরে আবার চেষ্টা করুন।";
      
      toast({
        title: "উত্তোলন ব্যর্থ",
        description: errorMessage,
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
      title="টাকা উত্তোলন করুন"
      description="আপনার অ্যাকাউন্ট থেকে টাকা উত্তোলন করতে নিচের ফর্মটি পূরণ করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="withdrawAmount" className="block text-sm font-medium font-bangla">
            পরিমাণ (টাকা)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-500">৳</span>
            </div>
            <Input
              id="withdrawAmount"
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
          <label htmlFor="reason" className="block text-sm font-medium font-bangla">
            কারণ (ঐচ্ছিক)
          </label>
          <Textarea
            id="reason"
            placeholder="উত্তোলনের কারণ লিখুন..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
            variant="destructive"
            disabled={isSubmitting}
            className="font-bangla"
          >
            {isSubmitting ? "প্রক্রিয়াধীন..." : "উত্তোলন করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}