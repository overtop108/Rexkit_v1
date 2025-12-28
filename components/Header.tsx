'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthDialog } from '@/components/AuthDialog';
import { User, LogOut, FolderOpen, Plus } from 'lucide-react';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            RexKit
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-10 w-24 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <>
                <Link href="/projects">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    My Projects
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:bg-slate-50 transition-all duration-200"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200 shadow-lg">
                    <div className="flex items-center gap-3 p-3">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem asChild>
                      <Link href="/projects" className="cursor-pointer text-slate-700 hover:text-slate-900">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        My Projects
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-slate-700 hover:text-slate-900">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => setAuthDialogOpen(true)}
                className="gradient-indigo text-white rounded-xl px-6 shadow-sm hover:shadow-md transition-all duration-200 button-scale"
              >
                <User className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
