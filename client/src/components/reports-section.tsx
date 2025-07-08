import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, Check, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { WorkSession } from "@shared/schema";

export default function ReportsSection() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const { data: sessions, isLoading } = useQuery<WorkSession[]>({
    queryKey: ['/api/work-sessions/date', selectedDate, userTimezone],
    queryFn: async () => {
      const response = await fetch(`/api/work-sessions/date?date=${selectedDate}&timezone=${encodeURIComponent(userTimezone)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
    retry: false,
    enabled: !!user, // Only fetch when user is loaded
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await fetch(`/api/work-sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/weekly'] });
      toast({
        title: "Session Deleted",
        description: "Work session has been successfully deleted",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete work session",
        variant: "destructive",
      });
    },
  });

  const handleDeleteSession = (sessionId: number) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteSessionMutation.mutate(sessionId);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}:00`;
  };

  const formatSessionTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: userTimezone
    });
  };

  const getSessionTypeIcon = () => {
    return <Play className="w-4 h-4 mr-1 text-primary" />;
  };

  const getStatusBadge = (completed: boolean) => {
    return completed ? (
      <Badge variant="default" className="bg-success/80 hover:bg-success/60 glass-effect text-white">
        <Check className="w-3 h-3 mr-1" />
        Completed
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 glass-effect text-white/90">
        <X className="w-3 h-3 mr-1" />
        Interrupted
      </Badge>
    );
  };

  return (
    <section className="mt-12">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl minimal-heading text-white/90">
            Detailed Reports
          </h2>
          <div className="flex space-x-2">
            <Button
              variant={activeTab === 'daily' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('daily')}
              className={activeTab === 'daily' ? 'bg-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}
            >
              Daily
            </Button>
            <Button
              variant={activeTab === 'weekly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('weekly')}
              className={activeTab === 'weekly' ? 'bg-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}
            >
              Weekly
            </Button>
            <Button
              variant={activeTab === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('monthly')}
              className={activeTab === 'monthly' ? 'bg-primary text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}
            >
              Monthly
            </Button>
          </div>
        </div>
        
        {/* Date Picker */}
        <div className="mb-6">
          <Label htmlFor="date-picker" className="text-sm minimal-text text-white/90 mb-2 block">
            Select Date
          </Label>
          <Input
            id="date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48 glass-effect text-white/90 border-white/20"
          />
        </div>

        {/* Session History Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-4 bg-white/20 rounded"></div>
                    <div className="w-20 h-4 bg-white/20 rounded"></div>
                    <div className="w-12 h-4 bg-white/20 rounded"></div>
                  </div>
                  <div className="w-20 h-6 bg-white/20 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="text-white/90 minimal-text min-w-20">
                        {formatSessionTime(session.startTime)}
                      </div>
                      <div className="flex items-center">
                        {getSessionTypeIcon()}
                        <span className="text-white/90 minimal-text">
                          Work
                        </span>
                      </div>
                      <div className="text-white/90 minimal-text">
                        {formatTime(session.actualDuration)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(session.completed)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={deleteSessionMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-white/60">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2 minimal-text">No sessions found</p>
                  <p className="text-sm minimal-text">Start a timer session to see your reports here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
