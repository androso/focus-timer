import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, BarChart3, LogOut } from "lucide-react";
import { Link } from "wouter";
import type { TimerSettings } from "@shared/schema";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeElapsed: number;
  sessionCount: number;
  startTime: Date | null;
}

export default function TimerDisplay() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    timeElapsed: 0,
    sessionCount: 1,
    startTime: null,
  });

  // Fetch timer settings
  const { data: settings } = useQuery<TimerSettings>({
    queryKey: ['/api/timer-settings'],
    retry: false,
  });

  // Fetch today's stats for focused time
  const { data: todayStats } = useQuery<{totalTime: number}>({
    queryKey: ['/api/stats/today'],
    retry: false,
  });

  // Create work session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      sessionType: string;
      plannedDuration: number;
      actualDuration: number;
      startTime: Date;
      endTime: Date;
      completed: boolean;
    }) => {
      // Convert dates to ISO strings for proper serialization
      const payload = {
        ...sessionData,
        startTime: sessionData.startTime.toISOString(),
        endTime: sessionData.endTime.toISOString(),
      };
      await apiRequest('POST', '/api/work-sessions', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/weekly'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      });
    },
  });

  // Update timer display
  useEffect(() => {
    if (timerState.isRunning && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isPaused]);

  // Update document title with timer
  useEffect(() => {
    if (timerState.isRunning) {
      const status = timerState.isPaused ? 'Paused' : 'Running';
      document.title = `${formatTime(timerState.timeElapsed)} - ${status} | Focus Timer`;
    } else {
      document.title = 'Focus Timer';
    }

    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'Focus Timer';
    };
  }, [timerState.timeElapsed, timerState.isRunning, timerState.isPaused]);

  const startTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      startTime: prev.startTime || new Date(),
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  const stopTimer = () => {
    // Save session when stopped
    if (timerState.startTime && timerState.timeElapsed > 0) {
      const endTime = new Date();
      const actualDuration = timerState.timeElapsed;

      createSessionMutation.mutate({
        sessionType: 'work',
        plannedDuration: actualDuration,
        actualDuration,
        startTime: timerState.startTime,
        endTime,
        completed: true,
      });

      toast({
        title: "Work Session Saved!",
        description: `Session saved (${formatTime(actualDuration)})`,
        variant: "default",
      });
    }

    // Reset timer
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeElapsed: 0,
      startTime: null,
      sessionCount: timerState.timeElapsed > 0 ? prev.sessionCount + 1 : prev.sessionCount,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center text-foreground overflow-hidden">
      {/* Header */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 md:top-8 mobile-header">
        <h1 className="text-sm font-light tracking-[0.3em] text-muted-foreground uppercase md:text-sm text-xs">
          Work Time
        </h1>
      </div>

      {/* Right Navigation Panel - Desktop */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden md:flex flex-col space-y-6">
        <Link href="/reports">
          <Button 
            className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 hover:scale-110 border border-border backdrop-blur-sm transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-secondary/25 group"
          >
            <BarChart3 className="w-5 h-5 text-secondary-foreground transition-transform duration-200 group-hover:scale-110" />
          </Button>
        </Link>
        
        <Button 
          onClick={() => window.location.href = '/api/logout'}
          className="w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 hover:scale-110 border border-border backdrop-blur-sm transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-secondary/25 group"
        >
          <LogOut className="w-5 h-5 text-secondary-foreground transition-transform duration-200 group-hover:scale-110" />
        </Button>
      </div>

      {/* Mobile Navigation Panel */}
      <div className="absolute top-6 right-6 flex md:hidden space-x-3">
        <Link href="/reports">
          <Button 
            className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 border border-border backdrop-blur-sm transition-all duration-200 flex items-center justify-center"
          >
            <BarChart3 className="w-4 h-4 text-secondary-foreground" />
          </Button>
        </Link>
        
        <Button 
          onClick={() => window.location.href = '/api/logout'}
          className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 border border-border backdrop-blur-sm transition-all duration-200 flex items-center justify-center"
        >
          <LogOut className="w-4 h-4 text-secondary-foreground" />
        </Button>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-16 md:mb-16 mobile-timer-container">
        <div className="text-8xl md:text-8xl font-light mb-4 tracking-wide mobile-timer-display">
          {formatTime(timerState.timeElapsed)}
        </div>
        <div className="text-sm font-light tracking-[0.25em] text-muted-foreground uppercase md:text-sm text-xs">
          {timerState.isRunning && !timerState.isPaused ? 'Running' : 
           timerState.isPaused ? 'Pause' : 
           'Ready'}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center space-x-8 md:space-x-8 mobile-controls">
        {!timerState.isRunning ? (
          <Button 
            onClick={startTimer}
            className="w-16 h-16 md:w-16 md:h-16 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground backdrop-blur-sm transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-primary/25 mobile-play-button"
          >
            <Play className="w-6 h-6 md:w-6 md:h-6 ml-1 transition-transform duration-200 group-hover:scale-110" />
          </Button>
        ) : (
          <>
            <Button 
              onClick={pauseTimer}
              className="w-16 h-16 md:w-16 md:h-16 rounded-full bg-secondary hover:bg-secondary/80 hover:scale-105 text-secondary-foreground backdrop-blur-sm transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-secondary/25 group mobile-control-button"
            >
              {timerState.isPaused ? <Play className="w-6 h-6 md:w-6 md:h-6 ml-1 transition-transform duration-200 group-hover:scale-110" /> : <Pause className="w-6 h-6 md:w-6 md:h-6 transition-transform duration-200 group-hover:scale-110" />}
            </Button>
            <Button 
              onClick={stopTimer}
              className="w-16 h-16 md:w-16 md:h-16 rounded-full bg-destructive hover:bg-destructive/80 hover:scale-105 text-destructive-foreground backdrop-blur-sm transition-all duration-200 flex items-center justify-center hover:shadow-lg hover:shadow-destructive/25 group mobile-control-button"
            >
              <Square className="w-6 h-6 md:w-6 md:h-6 transition-transform duration-200 group-hover:scale-110" />
            </Button>
          </>
        )}
      </div>

      {/* Session Info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center md:bottom-8 mobile-session-info">
        <div className="text-xs text-muted-foreground mb-2 md:text-xs">
          Session {timerState.sessionCount}
        </div>
        <div className="text-xs text-muted-foreground/60 md:text-xs px-4">
          Today's focused time: {Math.floor((todayStats?.totalTime || 0) / 60)}m {(todayStats?.totalTime || 0) % 60}s
        </div>
      </div>
    </div>
  );
}