import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { WorkSession } from "@shared/schema";

export default function RecentSessions() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const { data: sessions, isLoading } = useQuery<WorkSession[]>({
    queryKey: ['/api/work-sessions', userTimezone],
    queryFn: async () => {
      const response = await fetch(`/api/work-sessions?timezone=${encodeURIComponent(userTimezone)}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
    retry: false,
    enabled: isAuthenticated && !!user, // Only fetch when authenticated and user is loaded
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:00`;
  };

  const formatSessionTime = (date: Date) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    // Check if it's today or yesterday
    const isToday = sessionDate.toDateString() === today.toDateString();
    const isYesterday = sessionDate.toDateString() === yesterday.toDateString();
    
    const timeStr = sessionDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isYesterday) {
      return `Yesterday ${timeStr}`;
    } else {
      return sessionDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }) + ` ${timeStr}`;
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-8">
        <div className="flex items-center mb-6">
          <History className="w-5 h-5 text-secondary mr-3" />
          <h3 className="text-lg minimal-heading text-white/90">Recent Sessions</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-white/20 rounded-full mr-3"></div>
                <div>
                  <div className="w-24 h-4 bg-white/20 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-white/20 rounded"></div>
                </div>
              </div>
              <div className="w-12 h-4 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentSessions = sessions?.slice(0, 5) || [];

  return (
    <div className="glass-card p-8">
      <div className="flex items-center mb-6">
        <History className="w-5 h-5 text-secondary mr-3" />
        <h3 className="text-lg minimal-heading text-white/90">Recent Sessions</h3>
      </div>
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="minimal-text">No sessions yet</p>
            <p className="text-sm minimal-text">Start your first timer session!</p>
          </div>
        ) : (
          recentSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-primary"></div>
                <div>
                  <div className="flex items-center">
                    <Play className="w-3 h-3 mr-1 text-primary" />
                    <p className="minimal-text text-white/90">
                      Work Session
                    </p>
                  </div>
                  <p className="text-sm text-white/60 minimal-text">
                    {formatTime(session.actualDuration)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-white/60 minimal-text">
                  {formatSessionTime(session.startTime)}
                </span>
                <div className="mt-1">
                  <Badge variant={session.completed ? "default" : "secondary"} className="text-xs glass-effect">
                    {session.completed ? "Completed" : "Interrupted"}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
