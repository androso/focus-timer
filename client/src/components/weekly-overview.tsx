import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface WeeklyStats {
  day: string;
  totalTime: number;
}

export default function WeeklyOverview() {
  const { data: weeklyStats, isLoading } = useQuery<WeeklyStats[]>({
    queryKey: ['/api/stats/weekly'],
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

  const getProgressWidth = (time: number, maxTime: number) => {
    return maxTime > 0 ? (time / maxTime) * 100 : 0;
  };

  if (isLoading) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <BarChart3 className="w-5 h-5 text-success mr-2" />
            Weekly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="w-16 h-4 bg-muted rounded"></div>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-muted rounded-full mr-2"></div>
                  <div className="w-12 h-4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = weeklyStats || [];
  const maxTime = Math.max(...stats.map(s => s.totalTime), 1);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <BarChart3 className="w-5 h-5 text-success mr-2" />
          Weekly Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`text-muted-foreground min-w-20 ${
                stat.day === today ? 'font-medium text-foreground' : ''
              }`}>
                {stat.day === today ? 'Today' : stat.day}
              </span>
              <div className="flex items-center flex-1 ml-4">
                <div className="w-20 h-2 bg-muted rounded-full mr-2 relative overflow-hidden">
                  <div 
                    className="h-full progress-bar transition-all duration-300 ease-out"
                    style={{ width: `${getProgressWidth(stat.totalTime, maxTime)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-foreground min-w-16 text-right">
                  {formatTime(stat.totalTime)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
