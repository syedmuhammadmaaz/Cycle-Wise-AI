import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, FileText, Scale, Users, Shield, Mail } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">CycleWise</h1>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg">
            Please read these terms carefully before using CycleWise
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") govern your use of CycleWise AI ("we," "our," or "us") and our menstrual cycle tracking application and related services (collectively, the "Service").
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                CycleWise AI provides a comprehensive menstrual cycle tracking and health guidance platform that includes:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Menstrual cycle tracking and prediction</li>
                <li>AI-powered health insights and recommendations</li>
                <li>Calendar integration for automatic cycle detection</li>
                <li>Premium features including advanced analytics</li>
                <li>Personalized diet and wellness guidance</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Account Creation</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You must be at least 13 years old to use our Service</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Account Security</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Permitted Uses</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Personal menstrual cycle tracking and health management</li>
                  <li>Accessing AI health guidance and recommendations</li>
                  <li>Using calendar integration features as intended</li>
                  <li>Engaging with premium features if subscribed</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Prohibited Uses</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Sharing false or misleading health information</li>
                  <li>Attempting to reverse engineer or hack our systems</li>
                  <li>Using the Service for commercial purposes without permission</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Harassing other users or our staff</li>
                  <li>Uploading malicious code or attempting to disrupt the Service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Health Information Disclaimer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Health Information Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Important Medical Disclaimer</p>
                <p className="text-sm text-yellow-700">
                  CycleWise AI is not a medical device and does not provide medical advice, diagnosis, or treatment. 
                  Our Service is for informational and tracking purposes only. Always consult with a qualified healthcare 
                  provider for medical advice, diagnosis, or treatment.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Our AI health guidance is for informational purposes only</li>
                <li>Cycle predictions are estimates and may not be accurate</li>
                <li>We do not replace professional medical advice</li>
                <li>Seek immediate medical attention for urgent health concerns</li>
                <li>We are not responsible for health decisions made based on our Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                <Link to="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>, 
                which is incorporated into these Terms by reference.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>We implement industry-standard security measures to protect your data</li>
                <li>You have control over your personal information and can delete your account at any time</li>
                <li>We do not sell your personal information to third parties</li>
                <li>Calendar integration is read-only and limited to cycle-related events</li>
              </ul>
            </CardContent>
          </Card>

          {/* Subscription and Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Premium Features</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Premium features require a paid subscription</li>
                  <li>Subscription fees are billed in advance</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are handled on a case-by-case basis</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Free Trial</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Free trials are available for new users</li>
                  <li>Trial periods and terms may vary</li>
                  <li>You may be charged after the trial period unless you cancel</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by CycleWise AI and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>You may not copy, modify, or distribute our content without permission</li>
                <li>Our trademarks and logos may not be used without written consent</li>
                <li>You retain ownership of the personal data you provide to us</li>
                <li>We may use anonymized data to improve our Service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card>
            <CardHeader>
              <CardTitle>Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We strive to provide reliable service, but we cannot guarantee uninterrupted access:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>We may perform maintenance that temporarily affects availability</li>
                <li>Third-party integrations (like Google Calendar) may experience outages</li>
                <li>We are not liable for service interruptions beyond our control</li>
                <li>We reserve the right to modify or discontinue features with notice</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To the maximum extent permitted by law, CycleWise AI shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
                goodwill, or other intangible losses.
              </p>
              <p className="text-sm text-muted-foreground">
                Our total liability to you for any damages shall not exceed the amount you paid us in the 12 months 
                preceding the claim, or $100, whichever is greater.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for any reason, including if you breach these Terms.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>You may terminate your account at any time</li>
                <li>Upon termination, your right to use the Service ceases immediately</li>
                <li>We may retain certain information as required by law</li>
                <li>Provisions that by their nature should survive termination will remain in effect</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                by posting the new Terms on this page and updating the "Last updated" date. Your continued use of the 
                Service after such modifications constitutes acceptance of the updated Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:maaz@remap.ai" className="text-primary hover:underline">maaz@remap.ai</a></p>
                <p><strong>Legal Inquiries:</strong> <a href="mailto:hello@remap.ai" className="text-primary hover:underline">hello@remap.ai</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 CycleWise AI. Your wellness journey starts here.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
