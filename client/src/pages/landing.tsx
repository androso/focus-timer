import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, Target, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Clock className="text-primary text-2xl mr-3" />
              <span className="text-xl font-semibold text-foreground">Focus Timer</span>
            </div>
            <Button onClick={() => window.location.href = '/api/login'} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Boost Your <span className="text-primary">Productivity</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Track your work sessions, take meaningful breaks, and achieve your goals with our 
            Forest-inspired productivity timer.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
          >
            Get Started Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
              <CardTitle className="text-lg">Focus Timer</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                25-minute focused work sessions with automatic break reminders
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-12 h-12 mx-auto text-secondary mb-4" />
              <CardTitle className="text-lg">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detailed analytics and reports to monitor your productivity trends
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Target className="w-12 h-12 mx-auto text-success mb-4" />
              <CardTitle className="text-lg">Goal Setting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Set daily and weekly goals to stay motivated and focused
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-accent mb-4" />
              <CardTitle className="text-lg">User Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clean, distraction-free interface inspired by the best productivity apps
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-2xl p-12 shadow-sm">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Focus?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of users who have improved their productivity with our timer.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
          >
            Start Your First Session
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center">
            <Clock className="text-primary mr-2" />
            <span className="text-muted-foreground">Focus Timer - Built for productivity</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
