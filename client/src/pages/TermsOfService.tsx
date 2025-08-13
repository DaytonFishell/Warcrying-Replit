import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/SEOHead";

export default function TermsOfService() {
  return (
    <>
      <SEOHead 
        title="Terms of Service - Warcry Companion"
        description="Read the terms of service for Warcry Companion. Understand your rights and responsibilities when using our tabletop gaming companion app."
        keywords="terms of service, warcry companion, user agreement, terms and conditions, legal"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing and using the Warcry Companion application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Warcry Companion is a tabletop gaming companion application designed to help players manage their Warcry warbands, fighters, and battles. The service includes warband creation, battle tracking, fighter management, and game utilities to enhance your tabletop gaming experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">To use our service, you must:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Create an account through Replit's authentication system</li>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Acceptable Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">You agree not to use the service to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use the service for any commercial purpose without permission</li>
              <li>Share account credentials with other users</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. User Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              You retain ownership of the content you create using our service, including warband data, fighter information, and battle records. By using our service, you grant us a limited, non-exclusive license to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Store and process your content to provide the service</li>
              <li>Create backups and ensure data reliability</li>
              <li>Analyze usage patterns to improve our service (in anonymized form)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This application is a fan-made tool for the Warcry tabletop game. Warcry is a trademark of Games Workshop Ltd. We claim no ownership of Games Workshop's intellectual property. This service is provided for educational and entertainment purposes only and is not affiliated with or endorsed by Games Workshop.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Service Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We strive to maintain reliable service availability but cannot guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or technical issues. We are not liable for any inconvenience or loss resulting from service interruptions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Data and Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using our service, you consent to the collection and use of information in accordance with our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Disclaimer of Warranties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The service is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the service, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Termination</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms. Upon termination, your right to use the service will cease immediately, and your account and data may be deleted.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>12. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. Your continued use of the service after changes become effective constitutes acceptance of the new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>13. Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              These terms shall be interpreted and governed by the laws of the jurisdiction in which the service is operated, without regard to conflict of law provisions. Any disputes arising from these terms or the use of the service shall be resolved through appropriate legal channels.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>14. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us through the support features available in the application or through the platform hosting this service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>15. Severability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If any provision of these terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect. The invalid provision will be replaced with a valid provision that most closely matches the intent of the original provision.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}