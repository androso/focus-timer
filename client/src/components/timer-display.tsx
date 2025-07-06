import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, Square } from "lucide-react";
import type { TimerSettings } from "@shared/schema";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;
  sessionType: 'work' | 'break';
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
    timeRemaining: 25 * 60, // 25 minutes in seconds
    sessionType: 'work',
    sessionCount: 1,
    startTime: null,
  });

  // Fetch timer settings
  const { data: settings } = useQuery<TimerSettings>({
    queryKey: ['/api/timer-settings'],
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
      await apiRequest('POST', '/api/work-sessions', sessionData);
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
        setTimerState(prev => {
          if (prev.timeRemaining <= 1) {
            // Session completed
            const endTime = new Date();
            const actualDuration = prev.startTime 
              ? Math.floor((endTime.getTime() - prev.startTime.getTime()) / 1000)
              : getSessionDuration(prev.sessionType);
            
            createSessionMutation.mutate({
              sessionType: prev.sessionType,
              plannedDuration: getSessionDuration(prev.sessionType),
              actualDuration,
              startTime: prev.startTime!,
              endTime,
              completed: true,
            });

            // Show completion notification
            toast({
              title: "Session Complete!",
              description: `${prev.sessionType === 'work' ? 'Work' : 'Break'} session finished`,
              variant: "default",
            });

            // Auto-switch to break/work
            const nextType = prev.sessionType === 'work' ? 'break' : 'work';
            const nextDuration = getSessionDuration(nextType);
            
            return {
              ...prev,
              isRunning: false,
              isPaused: false,
              timeRemaining: nextDuration,
              sessionType: nextType,
              sessionCount: prev.sessionType === 'work' ? prev.sessionCount + 1 : prev.sessionCount,
              startTime: null,
            };
          }
          
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
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
  }, [timerState.isRunning, timerState.isPaused, createSessionMutation, toast]);

  // Initialize timer duration when settings change
  useEffect(() => {
    if (settings && !timerState.isRunning) {
      setTimerState(prev => ({
        ...prev,
        timeRemaining: getSessionDuration(prev.sessionType),
      }));
    }
  }, [settings, timerState.isRunning]);

  const getSessionDuration = (type: 'work' | 'break') => {
    const workDuration = settings?.workDuration || 25;
    const breakDuration = settings?.shortBreakDuration || 5;
    return type === 'work' ? workDuration * 60 : breakDuration * 60;
  };

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
    // Save incomplete session if it was started
    if (timerState.startTime) {
      const endTime = new Date();
      const actualDuration = Math.floor((endTime.getTime() - timerState.startTime.getTime()) / 1000);
      
      createSessionMutation.mutate({
        sessionType: timerState.sessionType,
        plannedDuration: getSessionDuration(timerState.sessionType),
        actualDuration,
        startTime: timerState.startTime,
        endTime,
        completed: false,
      });
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: getSessionDuration(prev.sessionType),
      startTime: null,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalDuration = getSessionDuration(timerState.sessionType);
    const elapsed = totalDuration - timerState.timeRemaining;
    return (elapsed / totalDuration) * 100;
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

  return (
    <Card className="max-w-md mx-auto stat-card">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          {timerState.sessionType === 'work' ? 'Work Session' : 'Break Time'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="w-48 h-48 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90 timer-circle" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="hsl(var(--muted))" 
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={timerState.sessionType === 'work' ? "hsl(var(--primary))" : "hsl(var(--accent))"} 
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground timer-display">
                {formatTime(timerState.timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <Button 
            onClick={startTimer}
            disabled={timerState.isRunning && !timerState.isPaused}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-colors flex items-center ${
              timerState.isRunning && !timerState.isPaused ? 'timer-active' : ''
            }`}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          
          <Button 
            onClick={pauseTimer}
            disabled={!timerState.isRunning}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-full font-medium transition-colors flex items-center"
          >
            <Pause className="w-4 h-4 mr-2" />
            {timerState.isPaused ? 'Resume' : 'Pause'}
          </Button>
          
          <Button 
            onClick={stopTimer}
            disabled={!timerState.isRunning}
            variant="secondary"
            className="px-6 py-3 rounded-full font-medium transition-colors flex items-center"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>

        {/* Session Info */}
        <div className="text-sm text-muted-foreground">
          <p>Session {timerState.sessionCount} • {timerState.sessionType === 'work' ? 'Focus Time' : 'Break Time'}</p>
          <p className="mt-1">
            {timerState.isRunning && !timerState.isPaused ? 'Running...' : 
             timerState.isPaused ? 'Paused' : 'Ready to start'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
