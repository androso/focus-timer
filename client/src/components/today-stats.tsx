import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";

interface TodayStats {
  completedSessions: number;
  totalTime: number;
  efficiency: number;
}

export default function TodayStats() {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: stats, isLoading } = useQuery<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }>({
    queryKey: ['/api/stats/today', userTimezone],
    queryFn: async () => {
      const response = await fetch(`/api/stats/today?timezone=${encodeURIComponent(userTimezone)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch today stats');
      }
      return response.json();
    },
    retry: false,
  });

  const formatTime = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${totalMinutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center mb-6">
          <CalendarDays className="w-5 h-5 text-primary mr-3" />
          <h3 className="text-lg minimal-heading text-white/95">Today's Progress</h3>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="w-24 h-4 bg-white/10 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-white/10 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedSessions = stats?.completedSessions || 0;
  const totalTime = stats?.totalTime || 0;
  const efficiency = stats?.efficiency || 0;

  return (
    <div className="glass-card p-8">
      <div className="flex items-center mb-6">
        <CalendarDays className="w-5 h-5 text-primary mr-3" />
        <h3 className="text-lg minimal-heading text-white/95">Today's Progress</h3>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-white/60 minimal-text">Completed Sessions</span>
          <span className="stat-number text-primary">{completedSessions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 minimal-text">Total Time</span>
          <span className="stat-number text-white flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            {formatTime(totalTime)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 minimal-text">Efficiency</span>
          <span className="stat-number text-success flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            {efficiency}%
          </span>
        </div>
      </div>
    </div>
  );
}