import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';
import { GraduationCap, Users, Shield, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student Login',
    description: 'Access events, register for programs, and track participation',
    color: 'bg-gradient-student',
  },
  coordinator: {
    icon: Users,
    title: 'Coordinator Login',
    description: 'Manage assigned events and coordinate activities',
    color: 'bg-gradient-coordinator',
  },
  admin: {
    icon: Shield,
    title: 'Admin Login',
    description: 'Full system access and administrative controls',
    color: 'bg-gradient-admin',
  },
};

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: `Welcome back! You are now logged in.`,
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Removed demo credentials buttons now that backend auth is enabled

  const RoleIcon = roleConfig[selectedRole].icon;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-effect border-primary/20 shadow-elegant">
        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${roleConfig[selectedRole].color}`}>
            <RoleIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">University Events</CardTitle>
          <CardDescription>Sign in to access the event management system</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
              <TabsTrigger value="coordinator" className="text-xs">Coordinator</TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">Admin</TabsTrigger>
            </TabsList>

            {Object.entries(roleConfig).map(([role, config]) => (
              <TabsContent key={role} value={role} className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{config.title}</h3>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
              )}
            </Button>
            {/* Signup link removed as coordinators are created by admin */}
          </form>

          {/* Demo credentials UI removed */}
        </CardContent>
      </Card>
    </div>
  );
};