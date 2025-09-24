import React from 'react';
import { Button } from '@/components/ui/button';
import { SignupForm } from '@/components/auth/SignupForm';
import { Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignupForm />
        <div className="text-center mt-4 flex items-center justify-center gap-3">
          <Link to="/">
            <Button variant="ghost">← Back to Home</Button>
          </Link>
          <span className="text-sm text-muted-foreground">Already have an account?</span>
          <Link to="/">
            <Button variant="link" className="px-1">Sign in</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
