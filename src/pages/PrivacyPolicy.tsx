import { Link } from 'react-router-dom'
import { Eye, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
                WyzeLens
              </span>
            </Link>
            
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              Privacy Policy
            </h1>
            <p className="text-slate-400 mb-8">Last updated: March 8, 2026</p>

            <div className="space-y-8 text-slate-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
                <p className="mb-4">
                  Labwyze Inc. ("we", "our", or "us") operates WyzeLens, an AI-powered competitive intelligence platform. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p>
                  By using WyzeLens, you agree to the collection and use of information in accordance with this policy. 
                  If you do not agree with our policies and practices, please do not use our service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">2.1 Information You Provide</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Account Information:</strong> Name, email address, company name, and authentication credentials</li>
                  <li><strong>Profile Information:</strong> Industry preferences, company URLs, competitor lists</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe (we do not store credit card details)</li>
                  <li><strong>Communication Data:</strong> Support tickets, feedback, and correspondence</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">2.2 Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Usage Data:</strong> Pages viewed, features used, time spent, click patterns</li>
                  <li><strong>Device Information:</strong> Browser type, operating system, IP address, device identifiers</li>
                  <li><strong>Log Data:</strong> Access times, error logs, API requests</li>
                  <li><strong>Cookies:</strong> Authentication tokens, session management, preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">2.3 Information from Third Parties</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Authentication Providers:</strong> Data from Clerk.com for user authentication</li>
                  <li><strong>Public Sources:</strong> Competitive intelligence gathered from publicly available sources</li>
                  <li><strong>AI Services:</strong> Processed data from Perplexity AI and Poe API</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
                <p className="mb-3">We use your information to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our competitive intelligence service</li>
                  <li>Process your transactions and manage your subscription</li>
                  <li>Generate personalized competitive insights and alerts</li>
                  <li>Send automated refresh notifications based on your plan</li>
                  <li>Communicate with you about updates, security alerts, and support</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Detect, prevent, and address technical issues and fraud</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Data Sharing and Disclosure</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">We DO NOT sell your personal information.</h3>
                
                <p className="mb-3">We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Service Providers:</strong> Clerk (auth), Supabase (database), Netlify (hosting), Stripe (payments), Perplexity AI, Poe API</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                  <li><strong>Business Transfers:</strong> In connection with merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Data Security</h2>
                <p className="mb-3">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption in transit (HTTPS/TLS) and at rest</li>
                  <li>Secure authentication via Clerk with role-based access control</li>
                  <li>Row-level security (RLS) in Supabase database</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Service role keys for backend operations with restricted access</li>
                  <li>Automated backup and disaster recovery procedures</li>
                </ul>
                <p className="mt-3">
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
                <p className="mb-3">We retain your information for as long as:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your account is active</li>
                  <li>Needed to provide you services</li>
                  <li>Required by law or for legitimate business purposes</li>
                </ul>
                <p className="mt-3">
                  Upon account deletion, we delete or anonymize your personal data within 30 days, 
                  except where retention is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
                <p className="mb-3">Depending on your location, you may have the following rights:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Restrict:</strong> Request restriction of processing in certain circumstances</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at <a href="mailto:privacy@labwyze.com" className="text-indigo-400 hover:text-indigo-300">privacy@labwyze.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  These countries may have different data protection laws. We ensure appropriate safeguards are in place to 
                  protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Children's Privacy</h2>
                <p>
                  WyzeLens is not intended for users under 18 years of age. We do not knowingly collect personal information 
                  from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Cookies and Tracking</h2>
                <p className="mb-3">We use cookies and similar technologies for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for authentication and security</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Analytics Cookies:</strong> Understand how you use our service</li>
                </ul>
                <p className="mt-3">
                  You can control cookies through your browser settings. Disabling certain cookies may limit functionality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Third-Party Links</h2>
                <p>
                  Our service may contain links to third-party websites (news sources, competitor sites). We are not responsible 
                  for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. California Privacy Rights (CCPA)</h2>
                <p className="mb-3">California residents have additional rights under the California Consumer Privacy Act:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Right to know what personal information is collected, used, shared, or sold</li>
                  <li>Right to delete personal information held by businesses</li>
                  <li>Right to opt-out of the sale of personal information (we do not sell data)</li>
                  <li>Right to non-discrimination for exercising CCPA rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">13. European Privacy Rights (GDPR)</h2>
                <p className="mb-3">
                  If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Right to access, rectification, erasure, and data portability</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to withdraw consent at any time</li>
                  <li>Right to lodge a complaint with a supervisory authority</li>
                </ul>
                <p className="mt-3">
                  Legal basis for processing: Contract performance, legitimate interests, consent, legal obligations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Posting the new policy on this page with updated "Last updated" date</li>
                  <li>Sending an email notification for material changes</li>
                  <li>Displaying a prominent notice in the application</li>
                </ul>
                <p className="mt-3">
                  Your continued use of WyzeLens after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">15. Contact Us</h2>
                <p className="mb-3">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <p><strong>Labwyze Inc.</strong></p>
                  <p>Email: <a href="mailto:privacy@labwyze.com" className="text-indigo-400 hover:text-indigo-300">privacy@labwyze.com</a></p>
                  <p>Website: <a href="https://labwyze.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">labwyze.com</a></p>
                  <p className="text-sm text-slate-400 mt-2">We will respond to your inquiry within 30 days.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center text-slate-500 text-sm">
          <p>© 2026 Labwyze Inc. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link to="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
