import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AlertTriangle } from "lucide-react";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddFundsModal({ isOpen, onClose }: AddFundsModalProps) {
  const [amount, setAmount] = useState<string>("");
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
        amount: parseFloat(amount)
      });
      
      toast({
        title: "ফান্ড অ্যাড সফল",
        description: `${amount} টাকা সফলভাবে আপনার অ্যাকাউন্টে যোগ করা হয়েছে`,
        variant: "default",
      });
      
      // Reset form
      setAmount("");
      
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
      title="নগদ টাকা যোগ করুন"
      description="আপনার অ্যাকাউন্টে নগদ টাকা যোগ করতে নিচের ফর্মটি পূরণ করুন।"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-amber-50 rounded-md border border-amber-200 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
            <div className="text-sm text-amber-800 font-bangla">
              <p className="font-medium">গুরুত্বপূর্ণ নোট:</p>
              <p>এই সিস্টেমে শুধুমাত্র নগদ টাকা যোগ করা যাবে। অনলাইন পেমেন্ট (বিকাশ, নগদ, রকেট ইত্যাদি) সাপোর্ট করা হয়না।</p>
            </div>
          </div>
        </div>
        
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
            {isSubmitting ? "প্রক্রিয়াধীন..." : "জমা করুন"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
