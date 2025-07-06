import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";

interface TodayStats {
  completedSessions: number;
  totalTime: number;
  efficiency: number;
}

export default function TodayStats() {
  const { data: stats, isLoading } = useQuery<TodayStats>({
    queryKey: ['/api/stats/today'],
    retry: false,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center mb-6">
          <CalendarDays className="w-5 h-5 text-primary mr-3" />
          <h3 className="text-lg minimal-heading text-white/90">Today's Progress</h3>
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
        <h3 className="text-lg minimal-heading text-white/90">Today's Progress</h3>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-white/60 minimal-text">Completed Sessions</span>
          <span className="stat-number text-primary">{completedSessions}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/60 minimal-text">Total Time</span>
          <span className="stat-number text-secondary flex items-center">
            <Clock className="w-4 h-4 mr-2" />
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
