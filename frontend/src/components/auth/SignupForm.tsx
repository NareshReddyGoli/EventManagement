import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleConfig = {
  student: {
    icon: GraduationCap,
    title: 'Student Signup',
    description: 'Create your account to register and participate in events',
    color: 'bg-gradient-student',
  },
};

type RoleKey = keyof typeof roleConfig;

export const SignupForm: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleKey>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // For student, registrationNumber will be used as username
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [username, setUsername] = useState(''); // not used anymore (student-only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  // Student course/branch inputs
  const [course, setCourse] = useState('B. Tech');
  const [branch, setBranch] = useState('CSE');
  const [branchOther, setBranchOther] = useState('');
  // Legacy optional IDs
  const [studentId, setStudentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const RoleIcon = useMemo(() => roleConfig[selectedRole].icon, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields based on role
    if (!firstName || !lastName || !registrationNumber || !email || !password || !confirmPassword) {
      toast({ title: 'Missing information', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your password.', variant: 'destructive' });
      return;
    }

    // Build payload mapping registrationNumber -> username for student
    const resolvedBranch = selectedRole === 'student'
      ? (course === 'B. Tech' ? (branch === 'Other' ? branchOther : branch) : branchOther)
      : undefined;
    const payload: any = {
      role: 'student',
      firstName,
      lastName,
      username: registrationNumber,
      email,
      password,
      // Store registration number also as studentId for backend record
      studentId: registrationNumber,
      course,
      branch: resolvedBranch,
    };

    const res = await signup(payload);
    if (res.success) {
      toast({ title: 'Account created', description: 'Welcome! Your account is ready.' });
      // Auto-login is attempted in signup; navigate to dashboard/home
      navigate('/');
    } else {
      toast({ title: 'Signup failed', description: res.message || 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="glass-effect border-primary/20 shadow-elegant">
        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${roleConfig[selectedRole].color}`}>
            <RoleIcon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>Join the campus events platform</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={selectedRole} onValueChange={(val) => setSelectedRole(val as RoleKey)}>
            <TabsList className="grid w-full grid-cols-1 mb-6">
              <TabsTrigger value="student" className="text-xs">Student</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-2">
              <div className="text-center">
                <h3 className="font-semibold text-lg">{roleConfig.student.title}</h3>
                <p className="text-sm text-muted-foreground">{roleConfig.student.description}</p>
              </div>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            {
              // Student-only form
              (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="regNo">Registration Number</Label>
                    <Input id="regNo" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <select
                      id="course"
                      className="w-full border rounded-md h-10 px-3 bg-background"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    >
                      <option>B. Tech</option>
                      <option>B. Sc.</option>
                      <option>B. Pharmacy</option>
                      <option>M. Sc.</option>
                      <option>BCA</option>
                      <option>MCA</option>
                      <option>M. Tech</option>
                    </select>
                  </div>

                  {course === 'B. Tech' ? (
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <select
                        id="branch"
                        className="w-full border rounded-md h-10 px-3 bg-background"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                      >
                        <option value="CSE">CSE</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="Civil">Civil</option>
                        <option value="ACSE">ACSE</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Agriculture">Agriculture</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="branchOther">Branch</Label>
                      <Input id="branchOther" value={branchOther} onChange={(e) => setBranchOther(e.target.value)} />
                    </div>
                  )}
                </div>
                {course === 'B. Tech' && branch === 'Other' && (
                  <div className="space-y-2">
                    <Label htmlFor="branchOther">Enter your branch</Label>
                    <Input id="branchOther" value={branchOther} onChange={(e) => setBranchOther(e.target.value)} />
                  </div>
                )}

                {/* Department removed for students as per requirements */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </>
              )
            }

            <Button type="submit" className="w-full bg-gradient-primary hover:shadow-glow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
