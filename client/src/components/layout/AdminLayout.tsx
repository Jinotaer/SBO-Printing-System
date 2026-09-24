import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminSidebar } from "./AdminSidebar";
import { AdminNavbar } from "./AdminNavbar";

/*
  Design Read: Operational Admin Shell for BukSU SBO Printing Portal
  Dials: DESIGN_VARIANCE 5 / MOTION_INTENSITY 3 / VISUAL_DENSITY 6
  System: shadcn/ui (base-nova) + bklit/charts + Tailwind v4 + Geist
  Shape: cards rounded-2xl, buttons rounded-xl, pills full
  Colors: Navy #073474, Orange #FF7701, Dark Espresso #2A1400, Gold #FFB647
  Note: Sidebar/Navbar now use shadcn Sidebar primitives (SidebarProvider/SidebarTrigger) + bklit shimmer
*/

interface AdminLayoutProps {
  children?: React.ReactNode;
  currentPageTitle?: string;
  currentPageSubtitle?: string;
}

export function AdminLayout({
  children,
  currentPageTitle = "Operations Dashboard",
  currentPageSubtitle = "Student Body Organization Printing Station Management",
}: AdminLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider className="bg-[#FAFAF9] font-sans text-[#2A1400] antialiased selection:bg-[#FF7701]/20 selection:text-[#2A1400]">
        <AdminSidebar />
        <SidebarInset className="bg-[#FAFAF9] overflow-x-hidden">
          {/* Top Navbar - shadcn Input/Button/Badge + SidebarTrigger + bklit */}
          <AdminNavbar currentPageTitle={currentPageTitle} currentPageSubtitle={currentPageSubtitle} />

          {/* Page Main Content Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
            {/* Top Page Header - using shadcn Card for consistency */}
            <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-card shadow-xs border-border/60">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2A1400] tracking-tight">{currentPageTitle}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">{currentPageSubtitle}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to="/welcome" target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 text-xs font-bold text-[#073474] border-border hover:bg-accent rounded-xl flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#FF7701]" />
                    <span>View Student Portal</span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Content Slot */}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default AdminLayout;
