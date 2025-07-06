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
          <p className="text-xl text-white/70 minimal-text max-w-2xl mx-auto mb-8">
            Track your work sessions, take meaningful breaks, and achieve your goals with our 
            minimalist productivity timer.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="glass-effect hover:bg-white/20 text-white border-white/20 px-8 py-4 text-lg minimal-text"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
            <h3 className="text-lg minimal-heading text-white/90 mb-2">Focus Timer</h3>
            <p className="text-white/60 minimal-text text-sm">
              25-minute focused work sessions with automatic break reminders
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <BarChart3 className="w-12 h-12 mx-auto text-secondary mb-4" />
            <h3 className="text-lg minimal-heading text-white/90 mb-2">Progress Tracking</h3>
            <p className="text-white/60 minimal-text text-sm">
              Detailed analytics and reports to monitor your productivity trends
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Target className="w-12 h-12 mx-auto text-success mb-4" />
            <h3 className="text-lg minimal-heading text-white/90 mb-2">Goal Setting</h3>
            <p className="text-white/60 minimal-text text-sm">
              Set daily and weekly goals to stay motivated and focused
            </p>
          </div>

          <div className="glass-card p-6 text-center hover:bg-white/10 transition-all">
            <Users className="w-12 h-12 mx-auto text-accent mb-4" />
            <h3 className="text-lg minimal-heading text-white/90 mb-2">User Friendly</h3>
            <p className="text-white/60 minimal-text text-sm">
              Clean, distraction-free interface inspired by the best productivity apps
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-card p-12">
          <h2 className="text-3xl minimal-heading text-white mb-4">
            Ready to Focus?
          </h2>
          <p className="text-white/70 minimal-text mb-8 max-w-md mx-auto">
            Join thousands of users who have improved their productivity with our timer.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="glass-effect hover:bg-white/20 text-white border-white/20 px-8 py-4 minimal-text"
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
            <span className="text-white/60 minimal-text">Focus Timer - Built for productivity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
