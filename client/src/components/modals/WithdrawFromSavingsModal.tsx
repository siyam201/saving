import { useState, FormEvent, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatBengaliCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface SavingsGoal {
  id: number;
  name: string;
  currentAmount: number;
  targetAmount: number;
}

interface WithdrawFromSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawFromSavingsModal({ isOpen, onClose }: WithdrawFromSavingsModalProps) {
  const [amount, setAmount] = useState("");
  const [savingsGoalId, setSavingsGoalId] = useState("");
  const [reason, setReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch savings goals when modal opens
  const { data: savingsGoals, isLoading: isLoadingGoals } = useQuery<SavingsGoal[]>({
    queryKey: ["savings-goals"],
    queryFn: () => apiRequest("/api/savings-goals"),
    enabled: isOpen,
  });
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setSavingsGoalId("");
      setReason("");
    }
  }, [isOpen]);
  
  // Set the first savings goal as default when data loads
  useEffect(() => {
    if (savingsGoals && savingsGoals.length > 0 && !savingsGoalId) {
      setSavingsGoalId(savingsGoals[0].id.toString());
    }
  }, [savingsGoals, savingsGoalId]);
  
  const { mutate: withdrawFromSavings, isPending: isProcessing } = useMutation({
    mutationFn: async (data: { amount: number; savingsGoalId: number; reason?: string }) => {
      return apiRequest("/api/user/withdraw-from-savings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["savings-goals"] });
      
      // Show success toast
      toast({
        title: "সেভিংস থেকে টাকা উত্তোলন সফল হয়েছে",
        description: `আপনার সেভিংস থেকে ৳${parseInt(amount).toLocaleString("bn-BD")} টাকা উত্তোলন করা হয়েছে।`,
      });
      
      // Close modal
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "টাকা উত্তোলন করতে সমস্যা হয়েছে",
        description: error.message || "অনুগ্রহ করে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    }
  });
  
  const selectedSavingsGoal = savingsGoalId 
    ? savingsGoals?.find((goal) => goal.id.toString() === savingsGoalId) 
    : null;
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate amount
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) {
      toast({
        title: "অবৈধ পরিমাণ",
        description: "অনুগ্রহ করে একটি বৈধ পরিমাণ উল্লেখ করুন।",
        variant: "destructive",
      });
      return;
    }
    
    if (amountValue <= 0) {
      toast({
        title: "অবৈধ পরিমাণ",
        description: "পরিমাণ অবশ্যই ০ এর চেয়ে বেশি হতে হবে।",
        variant: "destructive",
      });
      return;
    }
    
    // Validate savings goal
    if (!savingsGoalId) {
      toast({
        title: "সেভিংস গোল নির্বাচন করুন",
        description: "অনুগ্রহ করে একটি সেভিংস গোল নির্বাচন করুন।",
        variant: "destructive",
      });
      return;
    }
    
    // Check sufficient balance
    if (selectedSavingsGoal && amountValue > selectedSavingsGoal.currentAmount) {
      toast({
        title: "অপর্যাপ্ত সেভিংস ব্যালেন্স",
        description: "আপনার সেভিংস গোলে পর্যাপ্ত টাকা নেই।",
        variant: "destructive",
      });
      return;
    }
    
    // Submit withdrawal
    withdrawFromSavings({
      amount: amountValue,
      savingsGoalId: parseInt(savingsGoalId),
      reason: reason || undefined,
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-bangla">
            সেভিংস থেকে টাকা উত্তোলন করুন
          </DialogTitle>
          <DialogDescription className="font-bangla text-gray-600">
            আপনার সেভিংস গোল থেকে টাকা আপনার প্রধান একাউন্টে স্থানান্তর করুন।
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Savings Goal Selection */}
          <div className="space-y-2">
            <Label htmlFor="savingsGoal" className="font-bangla">
              সেভিংস গোল নির্বাচন করুন
            </Label>
            <Select
              value={savingsGoalId}
              onValueChange={setSavingsGoalId}
              disabled={isLoadingGoals || isProcessing}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="সেভিংস গোল নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {savingsGoals?.length > 0 ? (
                  savingsGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      <div className="flex justify-between w-full">
                        <span>{goal.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ৳{formatBengaliCurrency(goal.currentAmount)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    কোন সেভিংস গোল নেই
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {selectedSavingsGoal && (
              <div className="flex justify-between text-sm text-gray-500 font-bangla">
                <span>বর্তমান ব্যালেন্স:</span>
                <span>৳{formatBengaliCurrency(selectedSavingsGoal.currentAmount)}</span>
              </div>
            )}
          </div>
          
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="font-bangla">
              পরিমাণ (৳)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="উদাহরণ: 1000"
              min="1"
              step="any"
              disabled={isProcessing || isLoadingGoals}
              required
            />
          </div>
          
          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-bangla">
              কারণ (ঐচ্ছিক)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="টাকা উত্তোলনের কারণ লিখুন"
              disabled={isProcessing}
              rows={3}
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="font-bangla"
            >
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || !amount || !savingsGoalId || isLoadingGoals}
              className="font-bangla"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  প্রক্রিয়াধীন...
                </>
              ) : "উত্তোলন করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
