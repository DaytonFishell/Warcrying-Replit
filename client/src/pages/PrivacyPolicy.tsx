import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SEOHead from "@/components/SEOHead";

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead 
        title="Privacy Policy - Warcry Companion"
        description="Learn how Warcry Companion protects your privacy and handles your data. Comprehensive privacy policy covering data collection, usage, and your rights."
        keywords="privacy policy, data protection, warcry companion, user privacy, data security"
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Account Information</h4>
              <p className="text-muted-foreground">
                When you create an account, we collect your email address, name, and profile information provided through Replit's authentication system.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Game Data</h4>
              <p className="text-muted-foreground">
                We store the warbands, fighters, and battle information you create and manage within the application. This includes character statistics, battle outcomes, and game preferences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Information</h4>
              <p className="text-muted-foreground">
                We automatically collect information about how you use our service, including features accessed, session duration, and interaction patterns to improve the application.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">We use your information to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Provide and maintain the Warcry Companion service</li>
              <li>Save and sync your warbands and battle data across sessions</li>
              <li>Improve our application features and user experience</li>
              <li>Communicate with you about service updates or issues</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Information Sharing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">
              We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety, or that of our users</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Data Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption and access controls.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time by contacting us.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your personal information</li>
              <li>Export your game data in a portable format</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your session and provide core functionality. We do not use tracking cookies for advertising purposes. You can manage cookie preferences through your browser settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our application is hosted on Replit and uses their authentication system. Please review Replit's privacy policy for information about how they handle your data. We are not responsible for the privacy practices of third-party services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the service constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy or our data practices, please contact us through the application's support features or via the contact information provided in our Terms of Service.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}