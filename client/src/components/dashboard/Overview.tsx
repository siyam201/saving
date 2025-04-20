import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { AddFundsModal } from "@/components/modals/AddFundsModal";
import { DepositFundsModal } from "@/components/modals/DepositFundsModal";
import { WithdrawFundsModal } from "@/components/modals/WithdrawFundsModal";
import { WithdrawFromSavingsModal } from "@/components/modals/WithdrawFromSavingsModal";
import { SavingsGoalModal } from "@/components/modals/SavingsGoalModal";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Flag, PlusCircle, TrendingUp, Wallet } from "lucide-react";

interface OverviewProps {
  balance: number;
  totalSavings: number;
  savingsGoals: any[];
}

export function Overview({ balance, totalSavings, savingsGoals }: OverviewProps) {
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showDepositFundsModal, setShowDepositFundsModal] = useState(false);
  const [showWithdrawFundsModal, setShowWithdrawFundsModal] = useState(false);
  const [showWithdrawFromSavingsModal, setShowWithdrawFromSavingsModal] = useState(false);
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);

  // Get active goal with highest percentage for display
  const primaryGoal = savingsGoals && savingsGoals.length > 0
    ? savingsGoals.reduce((prev, current) => {
        const prevPercent = (prev.currentAmount / prev.targetAmount) * 100;
        const currentPercent = (current.currentAmount / current.targetAmount) * 100;
        return prevPercent > currentPercent ? prev : current;
      })
    : null;

  const goalProgress = primaryGoal 
    ? Math.round((primaryGoal.currentAmount / primaryGoal.targetAmount) * 100)
    : 0;

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Current Balance Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <Wallet className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate font-bangla">বর্তমান ব্যালেন্স</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">৳ {balance.toLocaleString()}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 py-4">
          <div className="text-sm flex justify-between">
            <Button 
              variant="link" 
              onClick={() => setShowAddFundsModal(true)}
              className="p-0 h-auto font-medium text-primary-600 hover:text-primary-500 font-bangla"
            >
              ফান্ড অ্যাড করুন <PlusCircle className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              variant="link" 
              onClick={() => setShowWithdrawFundsModal(true)}
              className="p-0 h-auto font-medium text-red-600 hover:text-red-500 font-bangla"
            >
              টাকা উত্তোলন <ArrowDownLeft className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Total Savings Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate font-bangla">মোট সেভিংস</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">৳ {totalSavings.toLocaleString()}</div>
                  {totalSavings > 0 && balance > 0 && (
                    <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      <span>{Math.round((totalSavings / (balance + totalSavings)) * 100)}%</span>
                    </p>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 py-4">
          <div className="text-sm flex justify-between">
            <Button 
              variant="link" 
              onClick={() => setShowDepositFundsModal(true)}
              className="p-0 h-auto font-medium text-primary-600 hover:text-primary-500 font-bangla"
            >
              টাকা জমা দিন <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
            <Button 
              variant="link" 
              onClick={() => setShowWithdrawFromSavingsModal(true)}
              className="p-0 h-auto font-medium text-amber-600 hover:text-amber-500 font-bangla"
            >
              সেভিংস থেকে আনুন <ArrowDownLeft className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Savings Goal Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
              <Flag className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate font-bangla">সেভিংস টার্গেট</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {primaryGoal ? `৳ ${primaryGoal.targetAmount.toLocaleString()}` : "কোন টার্গেট নেই"}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
          
          {primaryGoal && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-bangla">{primaryGoal.name}</span>
                <span className="text-sm font-medium text-gray-900">{goalProgress}%</span>
              </div>
              <div className="mt-1">
                <Progress value={goalProgress} variant="warning" className="h-2.5" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 py-4">
          <div className="text-sm">
            <Button 
              variant="link" 
              onClick={() => setShowSavingsGoalModal(true)}
              className="p-0 h-auto font-medium text-primary-600 hover:text-primary-500 font-bangla"
            >
              নতুন টার্গেট সেট করুন <PlusCircle className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Modals */}
      <AddFundsModal 
        isOpen={showAddFundsModal} 
        onClose={() => setShowAddFundsModal(false)} 
      />
      
      <DepositFundsModal 
        isOpen={showDepositFundsModal} 
        onClose={() => setShowDepositFundsModal(false)} 
      />
      
      <SavingsGoalModal 
        isOpen={showSavingsGoalModal} 
        onClose={() => setShowSavingsGoalModal(false)} 
      />
      
      <WithdrawFundsModal
        isOpen={showWithdrawFundsModal}
        onClose={() => setShowWithdrawFundsModal(false)}
      />
      
      <WithdrawFromSavingsModal
        isOpen={showWithdrawFromSavingsModal}
        onClose={() => setShowWithdrawFromSavingsModal(false)}
      />
    </div>
  );
}
