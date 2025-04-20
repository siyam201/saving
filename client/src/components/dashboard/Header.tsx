import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const user = getCurrentUser();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logoutUser();
    toast({
      title: "লগআউট সফল",
      description: "আপনি সফলভাবে লগআউট করেছেন",
    });
    window.location.href = "/auth";
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600 font-bangla">সেভিংস অ্যাপ</h1>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <Avatar className="h-8 w-8 bg-primary-100 text-primary-700">
                    <AvatarFallback className="font-medium text-sm">
                      {user ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 text-gray-700 font-medium font-bangla hidden sm:inline-block">
                    {user?.name || "অতিথি"}
                  </span>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-bangla">
                    <User className="mr-2 h-4 w-4" />
                    প্রোফাইল
                  </DropdownMenuItem>
                  <DropdownMenuItem className="font-bangla">
                    <Settings className="mr-2 h-4 w-4" />
                    সেটিংস
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="font-bangla" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
