import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ArrowLeft, Shield, Eye, Lock, Users, Database, Globe, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg">
            Your privacy and data security are our top priorities
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
                <Eye className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>CycleWise AI</strong> ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our menstrual cycle tracking application and related services.
              </p>
              <p>
                By using CycleWise, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Name and email address (for account creation)</li>
                  <li>Profile information (age, health preferences)</li>
                  <li>Menstrual cycle data (period dates, cycle length, symptoms)</li>
                  <li>Health and wellness notes you choose to share</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Calendar Integration Data</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Read-only access to calendar events containing menstrual-related keywords</li>
                  <li>Event titles and dates (only those related to menstrual health)</li>
                  <li>No access to personal calendar content unrelated to cycle tracking</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>App usage patterns and feature interactions</li>
                  <li>AI chat conversations (for improving our health guidance)</li>
                  <li>Device information and technical logs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Primary Uses</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Provide personalized cycle tracking and predictions</li>
                  <li>Generate AI-powered health insights and recommendations</li>
                  <li>Sync with your calendar to automatically track cycle events</li>
                  <li>Deliver premium features and subscription services</li>
                  <li>Improve our AI health guidance through conversation analysis</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Service Improvement</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Develop new features based on user needs</li>
                  <li>Ensure app security and prevent fraud</li>
                  <li>Provide customer support and respond to inquiries</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your data</li>
                <li><strong>Secure Infrastructure:</strong> Data is stored on secure, HIPAA-compliant servers</li>
                <li><strong>Regular Audits:</strong> We regularly audit our security practices</li>
                <li><strong>Data Minimization:</strong> We only collect data necessary for our services</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Information Sharing & Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-green-600">We DO NOT:</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Sell, rent, or trade your personal information to third parties</li>
                  <li>Share your health data with advertisers or marketing companies</li>
                  <li>Provide your information to employers or insurance companies</li>
                  <li>Access or store unrelated calendar event data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Limited Sharing Scenarios</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Service Providers:</strong> Trusted partners who help us operate our service (under strict confidentiality agreements)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Consent:</strong> When you explicitly give us permission to share</li>
                  <li><strong>Business Transfers:</strong> In case of merger or acquisition (with notice)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
                <li><strong>Withdraw Consent:</strong> Revoke calendar access or other permissions</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                To exercise these rights, contact us at <a href="mailto:hello@remap.ai" className="text-primary hover:underline">hello@remap.ai</a>
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Cycle Data:</strong> Kept for historical tracking and predictions</li>
                <li><strong>Usage Data:</strong> Retained for up to 2 years for service improvement</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                You can delete your account at any time, which will permanently remove your personal data from our systems.
              </p>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Our service integrates with the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li><strong>Google Calendar:</strong> Read-only access for cycle event detection</li>
                <li><strong>Supabase:</strong> Secure database hosting and authentication</li>
                <li><strong>Vercel:</strong> Application hosting and performance monitoring</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                These services have their own privacy policies. We recommend reviewing them to understand how they handle your data.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                CycleWise is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* International Users */}
          <Card>
            <CardHeader>
              <CardTitle>International Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                If you are accessing CycleWise from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located. By using our service, you consent to the transfer of your information to the United States.
              </p>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
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
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> <a href="mailto:hello@remap.ai" className="text-primary hover:underline">hello@remap.ai</a></p>
                <p><strong>General Support:</strong> <a href="mailto:maaz@remap.ai" className="text-primary hover:underline">maaz@remap.ai</a></p>
              </div>
              <p className="text-sm text-muted-foreground">
                We will respond to your inquiry within 30 days of receipt.
              </p>
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
