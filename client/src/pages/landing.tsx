import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, Target, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass-effect fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="text-white/90 text-2xl mr-3" />
              <span className="text-xl minimal-text text-white/90">Focus Timer</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'} className="glass-effect hover:bg-white/20 text-white border-white/20">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl minimal-heading text-white mb-6">
            Boost Your <span className="gradient-text">Productivity</span>
          </h1>
          <p className="text-xl text-white/85 minimal-text max-w-2xl mx-auto mb-8">
            Track your focused work time with our minimalist stopwatch timer. Start, pause, and 
            monitor your productivity sessions with detailed analytics.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="glass-effect hover:bg-white/20 hover:scale-105 hover:shadow-xl hover:shadow-white/10 text-white border-white/20 px-8 py-4 text-lg minimal-text transition-all duration-300"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg minimal-heading text-white/95 mb-2">Stopwatch Timer</h3>
            <p className="text-white/75 minimal-text text-sm">
              Track your work sessions from start to finish with flexible timing
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <BarChart3 className="w-12 h-12 mx-auto text-secondary mb-4" />
            <h3 className="text-lg minimal-heading text-white/95 mb-2">Progress Tracking</h3>
            <p className="text-white/75 minimal-text text-sm">
              Detailed analytics and reports to monitor your productivity trends
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Target className="w-12 h-12 mx-auto text-success mb-4" />
            <h3 className="text-lg minimal-heading text-white/95 mb-2">Goal Setting</h3>
            <p className="text-white/75 minimal-text text-sm">
              Set daily and weekly goals to stay motivated and focused
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Users className="w-12 h-12 mx-auto text-accent mb-4" />
            <h3 className="text-lg minimal-heading text-white/95 mb-2">User Friendly</h3>
            <p className="text-white/75 minimal-text text-sm">
              Clean, distraction-free interface inspired by the best productivity apps
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-card p-12">
          <h2 className="text-3xl minimal-heading text-white mb-4">
            Ready to Focus?
          </h2>
          <p className="text-white/85 minimal-text mb-8 max-w-md mx-auto">
            Join thousands of users who track their focused work time and improve productivity.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="glass-effect hover:bg-white/20 hover:scale-105 hover:shadow-xl hover:shadow-white/10 text-white border-white/20 px-8 py-4 minimal-text transition-all duration-300"
          >
            Start Your First Session
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <Clock className="text-primary mr-2" />
            <span className="text-white/75 minimal-text">Focus Timer - Built for productivity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
