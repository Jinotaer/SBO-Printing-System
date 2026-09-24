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
            {/* Content Slot */}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default AdminLayout;
