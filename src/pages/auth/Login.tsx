import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Lock, Mail, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Login successful!');
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!signupName.trim()) {
      toast.error('Please enter your name');
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please login instead.');
      } else {
        toast.error(error.message || 'Signup failed');
      }
    } else {
      toast.success('Account created! You can now login.');
      navigate('/');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-primary-foreground">
          <div className="w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center mb-8 backdrop-blur-sm">
            <UserCheck className="w-12 h-12" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4 font-bengali">আমার হাজিরা</h1>
          <p className="text-2xl mb-2">Amar Hajira</p>
          <p className="text-primary-foreground/70 text-center max-w-md">
            Smart School Attendance & Monitoring System
          </p>
          
          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold">1000+</p>
              <p className="text-sm text-primary-foreground/60 font-bengali">শিক্ষার্থী</p>
            </div>
            <div>
              <p className="text-4xl font-bold">50+</p>
              <p className="text-sm text-primary-foreground/60 font-bengali">শিক্ষক</p>
            </div>
            <div>
              <p className="text-4xl font-bold">99%</p>
              <p className="text-sm text-primary-foreground/60 font-bengali">নির্ভুলতা</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold font-bengali text-foreground">আমার হাজিরা</h1>
            <p className="text-muted-foreground">Amar Hajira</p>
          </div>

          <div className="card-elevated p-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
                  <p className="text-muted-foreground font-bengali">সিস্টেমে প্রবেশ করুন</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
                  <p className="text-muted-foreground font-bengali">নতুন অ্যাকাউন্ট তৈরি করুন</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Developed by <strong>Jubair Zaman</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
