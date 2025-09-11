import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
import { Dashboard } from './Dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Award, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (user) {
    return <Dashboard />;
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginForm onLoginSuccess={() => setShowLogin(false)} />
          <div className="text-center mt-4">
            <Button variant="ghost" onClick={() => setShowLogin(false)}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="glass-effect border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold gradient-text">University Events</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden sm:inline-flex">
                About
              </Button>
              <Button variant="ghost" className="hidden sm:inline-flex">
                Features
              </Button>
              <Button onClick={() => setShowLogin(true)} className="bg-gradient-primary">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-primary/10 rounded-full blur-3xl floating-element"></div>
              </div>
              <div className="relative">
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  University Event Management System
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="gradient-text">University Event</span>
                  <br />
                  <span className="text-foreground">Management</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                  Discover, create, and manage university events with ease. Connect with your academic 
                  community through our comprehensive event platform designed for students, coordinators, and administrators.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => setShowLogin(true)} className="bg-gradient-primary shadow-glow">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-primary/20">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-effect border-primary/20 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">500+</h3>
                <p className="text-muted-foreground">Events Hosted</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-primary/20 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">2,000+</h3>
                <p className="text-muted-foreground">Students Engaged</p>
              </CardContent>
            </Card>
            
            <Card className="glass-effect border-primary/20 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-coordinator rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text mb-2">50+</h3>
                <p className="text-muted-foreground">Departments</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage <span className="gradient-text">university events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides tools for administrators, coordinators, and students 
              to create, manage, and participate in university events seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-admin rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Tailored dashboards and features for administrators, coordinators, and students with 
                  appropriate permissions and capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Create, schedule, and manage events with ease. Handle registrations, venues, 
                  and attendance tracking all in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Digital Certificates</CardTitle>
                <CardDescription>
                  Generate and issue digital certificates for event participation with 
                  customizable templates and automatic distribution.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-coordinator rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track event performance, attendance rates, and engagement metrics 
                  to improve future events and student participation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-student rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Easy Registration</CardTitle>
                <CardDescription>
                  Streamlined registration process with dynamic forms, approval workflows, 
                  and automated confirmation notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-effect border-primary/20 hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Event Memories</CardTitle>
                <CardDescription>
                  Students can upload photos and share memories from events, 
                  creating a vibrant community archive of university life.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-effect border-primary/20 bg-gradient-primary/5">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students and faculty members who are already using our platform 
                to create and manage amazing university events.
              </p>
              <Button size="lg" onClick={() => setShowLogin(true)} className="bg-gradient-primary shadow-glow">
                Sign In Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 University Event Management System. Built with ❤️ for academic communities.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
