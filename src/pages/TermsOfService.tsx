import { Link } from 'react-router-dom'
import { Eye, ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-slate-400 mb-8">Last updated: March 8, 2026</p>

            <div className="space-y-8 text-slate-300">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                <p className="mb-4">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you and Labwyze Inc. 
                  ("Company", "we", "us", or "our") concerning your access to and use of WyzeLens, an AI-powered competitive 
                  intelligence platform (the "Service").
                </p>
                <p>
                  By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, 
                  you may not access or use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility</h2>
                <p className="mb-3">To use the Service, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be at least 18 years of age</li>
                  <li>Have the legal capacity to enter into binding contracts</li>
                  <li>Not be barred from using the Service under applicable law</li>
                  <li>Represent a legitimate business entity for business plans</li>
                </ul>
                <p className="mt-3">
                  By creating an account, you represent and warrant that you meet these eligibility requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Account Registration</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">3.1 Account Creation</h3>
                <p className="mb-3">To use the Service, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">3.2 Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account at any time for violation of these Terms, 
                  fraudulent activity, or at our discretion. You may terminate your account at any time through account settings.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription Plans and Billing</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">4.1 Subscription Plans</h3>
                <p className="mb-3">We offer the following subscription tiers:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Free:</strong> 1 profile, 5 competitors, 1 manual refresh/day, weekly automated refresh</li>
                  <li><strong>Starter ($8/month):</strong> 3 profiles, 10 competitors, 3 manual refreshes/day, daily automated refresh</li>
                  <li><strong>Pro ($20/month):</strong> 5 profiles, 15 competitors, unlimited manual refresh, hourly automated refresh</li>
                  <li><strong>Business ($49/month):</strong> 10 profiles, unlimited competitors, hourly automated refresh</li>
                  <li><strong>Enterprise:</strong> Custom pricing, features, and SLAs</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">4.2 Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscriptions are billed monthly in advance</li>
                  <li>Payments are processed securely through Stripe</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You authorize us to charge your payment method automatically</li>
                  <li>Failure to pay may result in suspension or termination of service</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">4.3 Plan Changes and Cancellations</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may upgrade or downgrade your plan at any time</li>
                  <li>Upgrades take effect immediately; you are charged the prorated difference</li>
                  <li>Downgrades take effect at the next billing cycle</li>
                  <li>You may cancel your subscription at any time (access continues until end of billing period)</li>
                  <li>Plan limits are enforced; exceeding limits requires upgrade</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">4.4 Price Changes</h3>
                <p>
                  We reserve the right to modify subscription pricing with 30 days' notice. Continued use after notice 
                  constitutes acceptance of new pricing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">5.1 Permitted Use</h3>
                <p className="mb-3">You may use the Service to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Monitor your competitive landscape</li>
                  <li>Analyze publicly available market intelligence</li>
                  <li>Generate strategic business insights</li>
                  <li>Track industry trends and news</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">5.2 Prohibited Use</h3>
                <p className="mb-3">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe intellectual property rights of others</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Reverse engineer, decompile, or disassemble the Service</li>
                  <li>Use automated tools to scrape or harvest data (beyond provided API)</li>
                  <li>Resell, sublicense, or transfer your access to others</li>
                  <li>Upload malware, viruses, or malicious code</li>
                  <li>Use the Service for illegal competitive espionage</li>
                  <li>Circumvent plan limits or usage restrictions</li>
                  <li>Create multiple accounts to abuse free tier</li>
                  <li>Interfere with or disrupt the Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">6.1 Our Ownership</h3>
                <p className="mb-3">
                  We own all rights, title, and interest in the Service, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Software, algorithms, and AI models</li>
                  <li>User interface and design</li>
                  <li>Trademarks, logos, and branding</li>
                  <li>Documentation and materials</li>
                </ul>
                <p className="mt-3">
                  Nothing in these Terms grants you ownership rights. You receive only a limited license to use the Service.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">6.2 Your Content</h3>
                <p className="mb-3">
                  You retain ownership of data you input (company URLs, industry preferences, etc.). By using the Service, you grant us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>License to process your input data to provide the Service</li>
                  <li>Right to generate and store insights derived from public sources</li>
                  <li>Permission to use aggregated, anonymized data for service improvement</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">6.3 Generated Insights</h3>
                <p>
                  Insights, alerts, and reports generated by the Service are provided to you under a non-exclusive license. 
                  We retain rights to the underlying AI models and methodologies used to generate these insights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Data and Privacy</h2>
                <p className="mb-3">
                  Your use of the Service is governed by our Privacy Policy, which is incorporated by reference into these Terms.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We collect and process data as described in our Privacy Policy</li>
                  <li>You consent to our use of cookies and tracking technologies</li>
                  <li>You are responsible for the legality of data you provide</li>
                  <li>We implement reasonable security measures but cannot guarantee absolute security</li>
                </ul>
                <p className="mt-3">
                  Review our <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link> for details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Third-Party Services</h2>
                <p className="mb-3">
                  The Service integrates with third-party services (AI providers, news sources, etc.):
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We are not responsible for third-party content or availability</li>
                  <li>Third-party services have their own terms and policies</li>
                  <li>Links to external sites are provided for convenience only</li>
                  <li>We do not endorse or control third-party content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Service Availability and Changes</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">9.1 Service Level</h3>
                <p className="mb-3">
                  We strive to provide reliable service but do not guarantee:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Uninterrupted or error-free operation</li>
                  <li>Specific uptime percentages (except for Enterprise SLAs)</li>
                  <li>Accuracy or completeness of competitive intelligence</li>
                  <li>Compatibility with all devices or browsers</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">9.2 Modifications</h3>
                <p>
                  We reserve the right to modify, suspend, or discontinue the Service (or any part) at any time with or without notice. 
                  We are not liable for any modification, suspension, or discontinuation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Disclaimers</h2>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                  <p className="mb-3 font-semibold">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</p>
                  <p className="mb-3">We disclaim all warranties, express or implied, including:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Merchantability and fitness for a particular purpose</li>
                    <li>Non-infringement and title</li>
                    <li>Accuracy, reliability, or quality of content</li>
                    <li>Results obtained from using the Service</li>
                    <li>Freedom from errors, bugs, or interruptions</li>
                  </ul>
                  <p className="mt-3">
                    Use of the Service is at your own risk. We do not warrant that the Service meets your requirements or that 
                    competitive intelligence will be accurate, complete, or timely.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">11. Limitation of Liability</h2>
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <p className="mb-3 font-semibold">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      We are not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, 
                      lost data, business interruption, or loss of goodwill
                    </li>
                    <li>
                      Our total liability for all claims arising from these Terms or the Service shall not exceed the amount you paid 
                      us in the 12 months preceding the claim (or $100 if no payment was made)
                    </li>
                    <li>
                      We are not liable for damages caused by factors beyond our control (force majeure, third-party services, user error)
                    </li>
                  </ul>
                  <p className="mt-3">
                    Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">12. Indemnification</h2>
                <p className="mb-3">
                  You agree to indemnify, defend, and hold harmless Labwyze Inc., its officers, directors, employees, and agents from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Claims arising from your use or misuse of the Service</li>
                  <li>Violation of these Terms or applicable law</li>
                  <li>Infringement of third-party intellectual property rights</li>
                  <li>Your content or business practices</li>
                  <li>Disputes with other users</li>
                </ul>
                <p className="mt-3">
                  This includes reasonable attorneys' fees and costs. We reserve the right to assume exclusive defense and control 
                  of any matter subject to indemnification.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">13. Dispute Resolution</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">13.1 Governing Law</h3>
                <p>
                  These Terms are governed by the laws of the jurisdiction where Labwyze Inc. is incorporated, without regard to 
                  conflict of law principles.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">13.2 Informal Resolution</h3>
                <p>
                  Before filing a claim, you agree to contact us at legal@labwyze.com to attempt informal resolution. 
                  We commit to responding within 30 days.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">13.3 Arbitration</h3>
                <p className="mb-3">
                  Any disputes not resolved informally shall be resolved by binding arbitration, except:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Claims in small claims court</li>
                  <li>Intellectual property disputes</li>
                  <li>Injunctive relief</li>
                </ul>
                <p className="mt-3">
                  Arbitration shall be conducted by a neutral arbitrator in accordance with applicable arbitration rules. 
                  You waive the right to a jury trial and class action.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">14. Termination</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">14.1 By You</h3>
                <p>
                  You may terminate your account at any time through account settings or by contacting support. 
                  Cancellation takes effect at the end of your current billing period. No refunds for partial months.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">14.2 By Us</h3>
                <p className="mb-3">We may terminate or suspend your account immediately if:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You violate these Terms</li>
                  <li>You engage in fraudulent or illegal activity</li>
                  <li>Your payment fails</li>
                  <li>We discontinue the Service</li>
                  <li>Required by law</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">14.3 Effect of Termination</h3>
                <p className="mb-3">Upon termination:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your access to the Service ceases immediately</li>
                  <li>All licenses granted to you terminate</li>
                  <li>We may delete your data after 30 days (except as required by law)</li>
                  <li>Provisions that survive termination remain in effect (liability, indemnification, dispute resolution)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">15. General Provisions</h2>
                
                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.1 Entire Agreement</h3>
                <p>
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Labwyze Inc. 
                  regarding the Service, superseding all prior agreements.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.2 Amendments</h3>
                <p>
                  We may modify these Terms at any time by posting updated Terms. Material changes will be notified via email 
                  or in-app notice. Continued use after changes constitutes acceptance.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.3 Assignment</h3>
                <p>
                  You may not assign or transfer these Terms or your account without our written consent. 
                  We may assign these Terms in connection with a merger, acquisition, or sale of assets.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.4 Severability</h3>
                <p>
                  If any provision is held invalid or unenforceable, the remaining provisions remain in full force and effect.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.5 Waiver</h3>
                <p>
                  Our failure to enforce any provision does not constitute a waiver of that provision or our right to enforce it later.
                </p>

                <h3 className="text-xl font-semibold text-slate-200 mb-3 mt-4">15.6 Force Majeure</h3>
                <p>
                  We are not liable for failure to perform due to causes beyond our reasonable control (natural disasters, war, 
                  internet outages, government actions, etc.).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
                <p className="mb-3">
                  For questions about these Terms or the Service:
                </p>
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <p><strong>Labwyze Inc.</strong></p>
                  <p>Email: <a href="mailto:legal@labwyze.com" className="text-indigo-400 hover:text-indigo-300">legal@labwyze.com</a></p>
                  <p>Support: <a href="mailto:support@labwyze.com" className="text-indigo-400 hover:text-indigo-300">support@labwyze.com</a></p>
                  <p>Website: <a href="https://labwyze.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">labwyze.com</a></p>
                </div>
              </section>

              <section className="bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-6 mt-8">
                <h2 className="text-2xl font-semibold text-white mb-4">Acknowledgment</h2>
                <p className="mb-3">
                  BY CREATING AN ACCOUNT AND USING WYZELENS, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
                </p>
                <p>
                  If you do not agree to these Terms, you must immediately stop using the Service and delete your account.
                </p>
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
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>
            <Link to="/" className="hover:text-white transition">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
