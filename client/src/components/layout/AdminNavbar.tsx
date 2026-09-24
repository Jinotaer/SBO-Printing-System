import { Search, Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminNavbarProps {
  currentPageTitle?: string;
  currentPageSubtitle?: string;
}

export function AdminNavbar({ currentPageTitle = "Operations Dashboard", currentPageSubtitle }: AdminNavbarProps) {
  return (
      <header className="sticky top-0 z-20 flex h-[70px] shrink-0 items-center gap-3 sm:gap-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 px-4 sm:px-6 lg:px-8 shadow-xs">
        {/* Left: Trigger + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="h-10 w-10 rounded-lg shrink-0 cursor-pointer" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-muted-foreground">
              <span className="text-sm sm:text-[16px] font-black tracking-tight text-[#073474] truncate max-w-[160px] sm:max-w-none">
                {currentPageTitle}
              </span>
            </div>
            {currentPageSubtitle && (
              <p className="hidden lg:block text-[12px] text-slate-500 font-medium truncate max-w-[420px] leading-none mt-0.5">
                {currentPageSubtitle}
              </p>
            )}
          </div>
        </div>


        {/* Right: Actions - pinned to far right */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-10 w-10 sm:h-10 sm:w-10 items-center justify-center rounded-lg hover:bg-gray-100 relative cursor-pointer" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF7701] rounded-full ring-2 ring-white animate-pulse" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <p className="text-xs font-black">Notifications</p>
                <p className="text-[11px] text-muted-foreground">3 new print jobs require attention</p>
              </div>
              <div className="p-2 space-y-1">
                <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                  <p className="text-xs font-bold text-[#073474]">New job: REQ-2024-001</p>
                  <p className="text-[11px] text-slate-500">Hannah Cruz — 18 pages • 2 copies</p>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-muted">
                  <p className="text-xs font-bold">Ready for claim: REQ-2024-003</p>
                  <p className="text-[11px] text-slate-500">Althea Santos — tray A</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>
  );
}

export default AdminNavbar;
