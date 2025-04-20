import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDownCircle, ArrowUpCircle, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useState } from "react";

export function TransactionHistory() {
  const [showAll, setShowAll] = useState(false);
  
  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  // Show only latest 5 transactions unless showAll is true
  const displayTransactions = !showAll && transactions ? transactions.slice(0, 5) : transactions;
  
  // Function to format date in Bengali
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    // Format: "১০ জুন, ২০২৩ · ১১:৩০ সকাল"
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return new Date(dateStr).toLocaleDateString('bn-BD', options);
  };
  
  // Function to get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add_funds':
        return <ArrowDownCircle className="h-6 w-6 text-green-600" />;
      case 'deposit':
        return <TrendingUp className="h-6 w-6 text-primary-600" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };
  
  // Function to get transaction type name in Bengali
  const getTransactionTypeName = (type: string) => {
    switch (type) {
      case 'add_funds':
        return 'ফান্ড অ্যাড';
      case 'deposit':
        return 'সেভিংস জমা';
      case 'withdrawal':
        return 'উত্তোলন';
      default:
        return type;
    }
  };
  
  // Function to get background color based on transaction type
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'add_funds':
        return 'bg-green-100';
      case 'deposit':
        return 'bg-primary-100';
      case 'withdrawal':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-5">
        <h3 className="text-lg font-medium text-gray-900 font-bangla">ট্রানজ্যাকশন হিস্টোরি</h3>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 font-bangla">লোড হচ্ছে...</div>
        ) : transactions && transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {displayTransactions?.map((transaction) => (
              <li key={transaction.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getIconBgColor(transaction.type)} flex items-center justify-center`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 font-bangla">
                          {getTransactionTypeName(transaction.type)}
                          {transaction.savingsGoalId && (
                            <Badge variant="outline" className="ml-2 font-bangla">
                              টার্গেট
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 font-bangla">
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      transaction.type === 'add_funds' ? 'text-green-600' : 
                      transaction.type === 'withdrawal' ? 'text-red-600' : 
                      'text-gray-900'
                    }`}>
                      {transaction.type === 'add_funds' ? '+' : ''}
                      ৳ {transaction.amount.toLocaleString()}
                    </div>
                  </div>
                  {transaction.description && (
                    <div className="mt-2 ml-14">
                      <p className="text-sm text-gray-500 font-bangla">{transaction.description}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500 font-bangla">
            কোন ট্রানজ্যাকশন নেই।
          </div>
        )}
      </div>
      
      {transactions && transactions.length > 5 && (
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 font-bangla"
          >
            {showAll ? "কম দেখুন" : "আরো দেখুন"}
          </Button>
        </div>
      )}
    </div>
  );
}
