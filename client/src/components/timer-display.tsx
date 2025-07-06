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
  timeElapsed: number;
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
    timeElapsed: 0, // starts at 0 and counts up
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

  // Update timer display - count up instead of down
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

  // No need to initialize from settings since we count up from 0

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
    // Save session when stopped
    if (timerState.startTime && timerState.timeElapsed > 0) {
      const endTime = new Date();
      const actualDuration = timerState.timeElapsed;
      
      createSessionMutation.mutate({
        sessionType: timerState.sessionType,
        plannedDuration: actualDuration, // Use actual duration as planned since it's user-controlled
        actualDuration,
        startTime: timerState.startTime,
        endTime,
        completed: true, // Consider it completed when user manually stops
      });

      toast({
        title: "Session Saved!",
        description: `${timerState.sessionType === 'work' ? 'Work' : 'Break'} session saved (${formatTime(actualDuration)})`,
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
      sessionCount: prev.sessionType === 'work' && timerState.timeElapsed > 0 ? prev.sessionCount + 1 : prev.sessionCount,
    }));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // For stopwatch mode, we'll show progress as a simple rotating circle
  const getProgress = () => {
    // Simple animation that rotates every 60 seconds
    return (timerState.timeElapsed % 60) * (100 / 60);
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (getProgress() / 100) * circumference;

  return (
    <Card className="max-w-md mx-auto stat-card">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          Stopwatch Timer
        </CardTitle>
        <p className="text-center text-muted-foreground">
          {timerState.sessionType === 'work' ? 'Focus Session' : 'Break Session'}
        </p>
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
                {formatTime(timerState.timeElapsed)}
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

        {/* Session Type Toggle */}
        <div className="mb-4 flex justify-center space-x-2">
          <button
            onClick={() => setTimerState(prev => ({ ...prev, sessionType: 'work' }))}
            disabled={timerState.isRunning}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              timerState.sessionType === 'work'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Work Session
          </button>
          <button
            onClick={() => setTimerState(prev => ({ ...prev, sessionType: 'break' }))}
            disabled={timerState.isRunning}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              timerState.sessionType === 'break'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Break Session
          </button>
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
