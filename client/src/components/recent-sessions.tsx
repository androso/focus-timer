import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Play } from "lucide-react";
import type { WorkSession } from "@shared/schema";

export default function RecentSessions() {
  const { data: sessions, isLoading } = useQuery<WorkSession[]>({
    queryKey: ['/api/work-sessions'],
    retry: false,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:00`;
  };

  const formatSessionTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <Card className="stat-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center">
            <History className="w-5 h-5 text-secondary mr-2" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-muted-foreground rounded-full mr-3"></div>
                  <div>
                    <div className="w-24 h-4 bg-muted-foreground rounded mb-1"></div>
                    <div className="w-16 h-3 bg-muted-foreground rounded"></div>
                  </div>
                </div>
                <div className="w-12 h-4 bg-muted-foreground rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentSessions = sessions?.slice(0, 5) || [];

  return (
    <Card className="stat-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center">
          <History className="w-5 h-5 text-secondary mr-2" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          {recentSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No sessions yet</p>
              <p className="text-sm">Start your first timer session!</p>
            </div>
          ) : (
            recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 session-work"></div>
                  <div>
                    <div className="flex items-center">
                      <Play className="w-3 h-3 mr-1 text-primary" />
                      <p className="font-medium text-foreground">
                        Work Session
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(session.actualDuration)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {formatSessionTime(session.startTime)}
                  </span>
                  <div className="mt-1">
                    <Badge variant={session.completed ? "default" : "secondary"} className="text-xs">
                      {session.completed ? "Completed" : "Interrupted"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
