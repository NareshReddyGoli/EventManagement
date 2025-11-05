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
  Sparkles,
  Zap,
  Shield,
  Heart,
  Globe,
  BookOpen,
  Trophy,
  Clock,
  MapPin,
  ChevronRight,
  Play,
  Download
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
      {/* Enhanced Header */}
      <nav className="glass-card border-b border-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">EventHub</h1>
                <p className="text-sm text-muted-foreground">University Events Platform</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#events" className="text-muted-foreground hover:text-primary transition-colors">Events</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex hover:bg-primary/5">Explore</Button>
              <Button onClick={() => setShowLogin(true)} className="btn-primary">
                Sign In
              </Button>
              <Link to="/signup">
                <Button variant="outline" className="btn-secondary">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Transform Your Campus Experience
                </Badge>
                <h1 className="heading-xl">
                  Create, Discover & 
                  <br />
                  <span className="gradient-text">Celebrate Events</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  Join thousands of students and faculty in our comprehensive event management platform. 
                  From workshops to festivals, make every moment count.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => setShowLogin(true)} className="btn-primary text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Link to="/signup">
                  <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-6">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-white flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-success border-2 border-white flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-coordinator border-2 border-white flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Trusted by 50+ Universities</p>
                  <p className="text-xs">Join 10,000+ active users</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl floating-element" />
              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card className="glass-card card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">500+ Events</h3>
                            <p className="text-sm text-muted-foreground">Hosted Successfully</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="glass-card card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">2,000+</h3>
                            <p className="text-sm text-muted-foreground">Active Students</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6 mt-12">
                    <Card className="glass-card card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-coordinator rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">50+</h3>
                            <p className="text-sm text-muted-foreground">Departments</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="glass-card card-hover">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-admin rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold">98%</h3>
                            <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-white/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="heading-lg mb-6">
              Everything you need to manage 
              <span className="gradient-text"> university events</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools administrators, coordinators, 
              and students need to create, manage, and participate in amazing events.
            </p>
          </div>

          <div className="grid-auto-fit">
            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-admin rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gradient">Role-Based Access</CardTitle>
                <CardDescription className="text-base">
                  Tailored dashboards and permissions for administrators, coordinators, and students 
                  with appropriate access controls and capabilities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gradient">Smart Event Management</CardTitle>
                <CardDescription className="text-base">
                  Create, schedule, and manage events with intelligent features. Handle registrations, 
                  venues, and attendance tracking seamlessly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gradient">Digital Certificates</CardTitle>
                <CardDescription className="text-base">
                  Generate and distribute digital certificates automatically with 
                  customizable templates and secure verification.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-coordinator rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gradient">Analytics & Insights</CardTitle>
                <CardDescription className="text-base">
                  Track event performance, attendance rates, and engagement metrics 
                  with detailed analytics and reporting tools.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-student rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gradient">Easy Registration</CardTitle>
                <CardDescription className="text-base">
                  Streamlined registration process with dynamic forms, approval workflows, 
                  and automated confirmation notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card card-hover group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-gradient">Event Memories</CardTitle>
                <CardDescription className="text-base">
                  Students can upload photos and share memories from events, 
                  creating a vibrant community archive of campus life.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <Globe className="w-4 h-4 mr-2" />
              How It Works
            </Badge>
            <h2 className="heading-lg mb-6">
              Get started in <span className="gradient-text">3 simple steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and faculty who are already using our platform 
              to create amazing university events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gradient">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your account and choose your role - student, coordinator, or administrator.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-success rounded-full flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gradient">Explore Events</h3>
                <p className="text-muted-foreground">
                  Browse upcoming events, register for workshops, or create your own events.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-coordinator rounded-full flex items-center justify-center mx-auto shadow-glow">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gradient">Connect & Learn</h3>
                <p className="text-muted-foreground">
                  Participate in events, earn certificates, and build lasting connections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section id="events" className="section-padding bg-white/50">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              <BookOpen className="w-4 h-4 mr-2" />
              Event Categories
            </Badge>
            <h2 className="heading-lg mb-6">
              Discover events that <span className="gradient-text">inspire you</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From academic workshops to cultural festivals, find events that match your interests 
              and help you grow both personally and professionally.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: BookOpen, label: 'Workshops', color: 'bg-blue-500' },
              { icon: Users, label: 'Seminars', color: 'bg-green-500' },
              { icon: Trophy, label: 'Competitions', color: 'bg-purple-500' },
              { icon: Heart, label: 'Cultural', color: 'bg-pink-500' },
              { icon: Zap, label: 'Sports', color: 'bg-orange-500' },
              { icon: Award, label: 'Academic', color: 'bg-indigo-500' }
            ].map((event, index) => (
              <Card key={index} className="glass-card card-hover text-center group">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${event.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <event.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gradient">{event.label}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-card border-primary/20 bg-gradient-primary/5">
            <CardContent className="py-16 px-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="heading-lg text-shadow">Ready to transform your campus experience?</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Join thousands of students and faculty members who are already using our platform 
                    to create and manage amazing university events.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button size="lg" onClick={() => setShowLogin(true)} className="btn-primary text-lg px-8 py-6">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Link to="/signup">
                    <Button size="lg" variant="outline" className="btn-secondary text-lg px-8 py-6">
                      <Download className="w-5 h-5 mr-2" />
                      Download App
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free to use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>No setup required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-primary/10 py-16 bg-white/30">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">EventHub</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Your comprehensive platform for discovering, creating, and managing university events. 
                Connect, learn, and grow with your campus community.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
                  <Users className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gradient">Explore</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#events" className="hover:text-primary transition-colors">All Events</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Workshops</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Seminars</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Competitions</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cultural Events</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gradient">For Teams</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Coordinator Guide</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Venue Management</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Certificate Templates</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Analytics Dashboard</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-gradient">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground">© 2024 EventHub. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;