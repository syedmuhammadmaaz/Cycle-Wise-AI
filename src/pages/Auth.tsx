import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account."
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Health Wise AI Tracker</CardTitle>
          <CardDescription>Your personal cycle companion</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;




// import { useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/hooks/useAuth';
// import { toast } from '@/hooks/use-toast';
// import { Heart } from 'lucide-react';
// import { motion } from 'framer-motion';

// const fadeIn = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// const Auth = () => {
//   const { user, signIn, signUp } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }

//   const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;

//     const { error } = await signIn(email, password);

//     if (error) {
//       toast({
//         title: "Error signing in",
//         description: error.message,
//         variant: "destructive"
//       });
//     }

//     setIsLoading(false);
//   };

//   const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const email = formData.get('email') as string;
//     const password = formData.get('password') as string;
//     const fullName = formData.get('fullName') as string;

//     const { error } = await signUp(email, password, fullName);

//     if (error) {
//       toast({
//         title: "Error creating account",
//         description: error.message,
//         variant: "destructive"
//       });
//     } else {
//       toast({
//         title: "Account created successfully",
//         description: "Please check your email to verify your account."
//       });
//     }

//     setIsLoading(false);
//   };

//   return (
//     <motion.div 
//       className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/30 p-4"
//       initial="hidden"
//       animate="visible"
//       variants={fadeIn}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//     >
//       <motion.div 
//         initial={{ scale: 0.95, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.5, ease: 'easeOut' }}
//       >
//         <Card className="w-full max-w-md shadow-xl rounded-2xl border-2 border-primary/30">
//           <CardHeader className="text-center">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.3 }}
//               className="flex justify-center mb-4"
//             >
//               <Heart className="h-8 w-8 text-primary animate-pulse" />
//             </motion.div>
//             <CardTitle className="text-2xl font-bold text-primary">Welcome to Health Wise AI Tracker</CardTitle>
//             <CardDescription>Your personal cycle companion</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="signin" className="w-full">
//               <TabsList className="grid w-full grid-cols-2 bg-muted rounded-full">
//                 <TabsTrigger value="signin">Sign In</TabsTrigger>
//                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
//               </TabsList>
//               <TabsContent value="signin">
//                 <motion.form
//                   onSubmit={handleSignIn}
//                   className="space-y-4"
//                   variants={fadeIn}
//                   initial="hidden"
//                   animate="visible"
//                   transition={{ delay: 0.1 }}
//                 >
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input id="email" name="email" type="email" placeholder="your@email.com" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password</Label>
//                     <Input id="password" name="password" type="password" required />
//                   </div>
//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? "Signing in..." : "Sign In"}
//                   </Button>
//                 </motion.form>
//               </TabsContent>
//               <TabsContent value="signup">
//                 <motion.form
//                   onSubmit={handleSignUp}
//                   className="space-y-4"
//                   variants={fadeIn}
//                   initial="hidden"
//                   animate="visible"
//                   transition={{ delay: 0.1 }}
//                 >
//                   <div className="space-y-2">
//                     <Label htmlFor="fullName">Full Name</Label>
//                     <Input id="fullName" name="fullName" type="text" placeholder="Your name" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="email">Email</Label>
//                     <Input id="email" name="email" type="email" placeholder="your@email.com" required />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="password">Password</Label>
//                     <Input id="password" name="password" type="password" minLength={6} required />
//                   </div>
//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? "Creating account..." : "Create Account"}
//                   </Button>
//                 </motion.form>
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default Auth;



