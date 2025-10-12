import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';
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
import { Link, useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Redirect logged-in users to appropriate dashboard
    if (user) {
      if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'admin' || user.role === 'coordinator') {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

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
      {/* Header */}
      <nav className="glass-effect border-b border-primary/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-glow" />
              <h1 className="text-xl font-bold gradient-text">Campus Events</h1>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <button className="text-muted-foreground hover:text-foreground transition-colors">Events</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">Coordinators</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">About</button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">Contact</button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex">Explore</Button>
              <Button onClick={() => setShowLogin(true)} className="bg-gradient-primary">Sign In</Button>
              <Link to="/signup">
                <Button variant="outline" className="border-primary/20">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero + Image Collage */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="relative inline-flex">
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Celebrate. Connect. Create.
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Make every campus moment
                <br />
                <span className="gradient-text">unforgettable</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
                Discover inspiring workshops, vibrant fests, and insightful seminars. Organize
                and participate with a seamless experience crafted for students, coordinators, and admins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => setShowLogin(true)} className="bg-gradient-primary shadow-glow">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="border-primary/20">Create Account</Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=64&q=80&auto=format&fit=crop" alt="crowd" className="w-8 h-8 rounded-full border border-primary/20" />
                  <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=64&q=80&auto=format&fit=crop" alt="celebration" className="w-8 h-8 rounded-full border border-primary/20" />
                  <img src="https://images.unsplash.com/photo-1488998527040-85054a85150e?w=64&q=80&auto=format&fit=crop" alt="workshop" className="w-8 h-8 rounded-full border border-primary/20" />
                </div>
                Trusted by 50+ departments
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="grid grid-cols-3 gap-4 relative">
                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&auto=format&fit=crop" alt="Fest" className="rounded-xl shadow-lg object-cover h-40 w-full" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg';}} />
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop" alt="Seminar" className="rounded-xl shadow-lg object-cover h-56 w-full mt-6" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg';}} />
                <img src="https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&q=80&auto=format&fit=crop" alt="Workshop" className="rounded-xl shadow-lg object-cover h-48 w-full mt-2" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg';}} />
                <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80&auto=format&fit=crop" alt="Concert" className="rounded-xl shadow-lg object-cover h-56 w-full col-span-2" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg';}} />
                <img src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=600&q=80&auto=format&fit=crop" alt="Team" className="rounded-xl shadow-lg object-cover h-40 w-full" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder.svg';}} />
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

      {/* Event Gallery with Positive Vibes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold">Moments that matter</h3>
              <p className="text-muted-foreground">A glimpse into the energy on campus</p>
            </div>
            <Button variant="outline" className="border-primary/20">View All Memories</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img className="rounded-lg object-cover h-44 w-full" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop" alt="Crowd cheering" />
            <img className="rounded-lg object-cover h-44 w-full" src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop" alt="Festival lights" />
            <img className="rounded-lg object-cover h-44 w-full" src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80&auto=format&fit=crop" alt="Hands up" />
            <img className="rounded-lg object-cover h-44 w-full" src="https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80&auto=format&fit=crop" alt="Workshop smiles" />
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
              <div className="flex items-center justify-center gap-3">
                <Button size="lg" onClick={() => setShowLogin(true)} className="bg-gradient-primary shadow-glow">
                  Sign In Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="border-primary/20">Sign Up Now</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-md bg-gradient-primary" />
                <span className="font-semibold">Campus Events</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your hub for discovering and organizing campus life. Join, host, and celebrate.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Explore</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground" href="#">All Events</a></li>
                <li><a className="hover:text-foreground" href="#">Workshops</a></li>
                <li><a className="hover:text-foreground" href="#">Fests</a></li>
                <li><a className="hover:text-foreground" href="#">Seminars</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">For Teams</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground" href="#">Coordinator Guide</a></li>
                <li><a className="hover:text-foreground" href="#">Venue Management</a></li>
                <li><a className="hover:text-foreground" href="#">Certificates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a className="hover:text-foreground" href="#">About</a></li>
                <li><a className="hover:text-foreground" href="#">Contact</a></li>
                <li><a className="hover:text-foreground" href="#">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2024 Campus Events. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
