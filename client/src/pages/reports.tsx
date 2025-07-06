
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import TodayStats from "@/components/today-stats";
import RecentSessions from "@/components/recent-sessions";
import WeeklyOverview from "@/components/weekly-overview";
import ReportsSection from "@/components/reports-section";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass-effect fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="text-white/90 text-2xl mr-3" />
              <span className="text-xl minimal-text text-white/90">Focus Timer</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 group">
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:translate-x-[-2px]" />
                  Back
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.href = '/api/logout'}
                className="text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 group"
              >
                <Clock className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl minimal-heading text-white mb-4">Reports & Analytics</h1>
          <p className="text-white/80 minimal-text">Detailed view of your productivity sessions and statistics</p>
        </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <TodayStats />
          <RecentSessions />
          <WeeklyOverview />
        </div>

        <ReportsSection />
      </main>
    </div>
  );
}
