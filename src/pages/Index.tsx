import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Calendar, MessageCircle, Shield, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to Health Wise AI 
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your personal menstrual cycle companion. Track your cycles, get AI-powered health guidance, 
            and take control of your wellness journey.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need for cycle wellness</h2>
          <p className="text-muted-foreground">Comprehensive tools designed with your health in mind</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Smart Cycle Tracking</CardTitle>
              <CardDescription>
                Track your periods with ease and get accurate predictions for your next cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Period and cycle length tracking</li>
                <li>• Symptom logging</li>
                <li>• Google Calendar integration</li>
                <li>• Personalized insights</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>AI Health Guide</CardTitle>
              <CardDescription>
                Get personalized health advice and support from our AI-powered wellness assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Personalized diet recommendations</li>
                <li>• Symptom management tips</li>
                <li>• Emotional wellness support</li>
                <li>• 24/7 availability</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Your health data is encrypted and secure. You have full control over your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• End-to-end encryption</li>
                <li>• HIPAA compliant</li>
                <li>• No data selling</li>
                <li>• Full data control</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Premium Features */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader className="text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Premium Features</CardTitle>
            <CardDescription>
              Unlock advanced insights and personalized guidance with Bloom Premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed cycle patterns, fertility windows, and health trend analysis
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Unlimited AI Chats</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited conversations with your AI health guide
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Custom Diet Plans</h3>
                <p className="text-sm text-muted-foreground">
                  Personalized nutrition recommendations based on your cycle
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priority Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help when you need it most with priority customer support
                </p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link to="/auth">Start Free Trial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 Health Wise AI. Your wellness journey starts here.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
