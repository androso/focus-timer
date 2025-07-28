import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/lib/authUtils";

interface WeeklyStats {
  day: string;
  totalTime: number;
}

export default function WeeklyOverview() {
  const { user } = useAuth();
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: weeklyData, isLoading } = useQuery<{
    day: string;
    totalTime: number;
  }[]>({
    queryKey: ['/api/stats/weekly', userTimezone],
    queryFn: async () => {
      const response = await authFetch(`/api/stats/weekly?timezone=${encodeURIComponent(userTimezone)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch weekly stats');
      }
      return response.json();
    },
    retry: false,
    enabled: !!user, // Only fetch when user is loaded
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getProgressWidth = (time: number, maxTime: number) => {
    return maxTime > 0 ? (time / maxTime) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-5 h-5 text-success mr-3" />
          <h3 className="text-lg minimal-heading text-white/90">Weekly Overview</h3>
        </div>
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="w-16 h-4 bg-white/20 rounded"></div>
              <div className="flex items-center">
                <div className="w-20 h-2 bg-white/20 rounded-full mr-2"></div>
                <div className="w-12 h-4 bg-white/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = weeklyData || [];
  const maxTime = Math.max(...stats.map(s => s.totalTime), 1);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="glass-card p-8">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-5 h-5 text-success mr-3" />
        <h3 className="text-lg minimal-heading text-white/90">Weekly Overview</h3>
      </div>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-white/60 minimal-text min-w-20 ${
              stat.day === today ? 'font-medium text-white/90' : ''
            }`}>
              {stat.day === today ? 'Today' : stat.day}
            </span>
            <div className="flex items-center flex-1 ml-4">
              <div className="w-20 h-2 bg-white/10 rounded-full mr-2 relative overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${getProgressWidth(stat.totalTime, maxTime)}%` }}
                ></div>
              </div>
              <span className="text-sm text-white/90 minimal-text min-w-16 text-right">
                {formatTime(stat.totalTime)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}