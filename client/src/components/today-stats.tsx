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
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <CalendarDays className="w-5 h-5 text-primary mr-2" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-24 h-4 bg-muted rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedSessions = stats?.completedSessions || 0;
  const totalTime = stats?.totalTime || 0;
  const efficiency = stats?.efficiency || 0;

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <CalendarDays className="w-5 h-5 text-primary mr-2" />
          Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Completed Sessions</span>
            <span className="text-2xl font-bold text-primary">{completedSessions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Time</span>
            <span className="text-2xl font-bold text-secondary flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(totalTime)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Efficiency</span>
            <span className="text-2xl font-bold text-success flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {efficiency}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
