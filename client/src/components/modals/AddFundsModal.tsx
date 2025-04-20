import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("বিকাশ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      await apiRequest("POST", "/api/user/add-funds", {
        amount: parseFloat(amount),
        paymentMethod,
      });
      
      toast({
        title: "ফান্ড অ্যাড সফল",
        description: `${amount} টাকা সফলভাবে আপনার অ্যাকাউন্টে যোগ করা হয়েছে`,
        variant: "default",
      });
      
      // Reset form
      setAmount("");
      setPaymentMethod("বিকাশ");
      
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      
      onClose();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "ফান্ড অ্যাড ব্যর্থ",
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
      title="ফান্ড অ্যাড করুন"
      description="আপনার অ্যাকাউন্টে ফান্ড অ্যাড করতে নিচের ফর্মটি পূরণ করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="amount" className="block text-sm font-medium font-bangla">
            পরিমাণ (টাকা)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-gray-500">৳</span>
            </div>
            <Input
              id="amount"
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
          <label htmlFor="paymentMethod" className="block text-sm font-medium font-bangla">
            পেমেন্ট মেথড
          </label>
          <Select
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            disabled={isSubmitting}
          >
            <SelectTrigger id="paymentMethod" className="font-bangla">
              <SelectValue placeholder="পেমেন্ট মেথড নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="বিকাশ" className="font-bangla">বিকাশ</SelectItem>
              <SelectItem value="নগদ" className="font-bangla">নগদ</SelectItem>
              <SelectItem value="রকেট" className="font-bangla">রকেট</SelectItem>
              <SelectItem value="ক্রেডিট কার্ড" className="font-bangla">ক্রেডিট কার্ড</SelectItem>
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
            {isSubmitting ? "প্রক্রিয়াধীন..." : "কনফার্ম"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
