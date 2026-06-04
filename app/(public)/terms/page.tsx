import Link from 'next/link'
import { SiteNav } from '@/components/layout/site-nav'

export const metadata = {
  title: 'Terms of Service — DeadlineZero',
  description: 'Terms and conditions for using the DeadlineZero service.',
}

export default function TermsPage() {
  return (
    <div className="flex-1 bg-[#0B1020]">
      <SiteNav />

      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
        <div className="flex flex-col gap-3 mb-10">
          <h1 className="text-[32px] font-bold text-white">Terms of Service</h1>
          <p className="text-[14px] font-normal text-[#A1B7E7]/60">Last updated: June 2026</p>
        </div>

        <div className="flex flex-col gap-8 text-[16px] font-normal text-[#A1B7E7] leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using DeadlineZero (&ldquo;the Service&rdquo;) at deadlinezero.com, you agree to
              be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms,
              please do not use the Service.
            </p>
            <p>
              These Terms apply to all users of the Service, including visitors, registered users,
              and paying subscribers.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">2. Description of Service</h2>
            <p>
              DeadlineZero is a financial tracking tool that helps users monitor deferred-interest
              and promotional financing deals. The Service provides:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Calculation of required monthly payments to avoid retroactive interest</li>
              <li>Deadline tracking and email alert notifications</li>
              <li>Retroactive interest exposure estimates</li>
              <li>Optional bank account synchronization via Plaid (Premium)</li>
            </ul>
            <p>
              DeadlineZero provides informational tools only. We are not a financial advisor,
              lender, or credit counseling service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">3. User Accounts</h2>
            <p>
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized account access</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these Terms or
              that we determine, in our sole discretion, pose a risk to the Service or other users.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">4. Subscription Plans and Billing</h2>
            <p>
              DeadlineZero offers a Free plan and a Premium plan. Premium features are available
              via a monthly or annual subscription billed through Stripe.
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Subscription fees are charged at the beginning of each billing period</li>
              <li>You may cancel your subscription at any time through the billing portal</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>We do not offer refunds for partial subscription periods</li>
              <li>We reserve the right to change pricing with 30 days&rsquo; notice</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">5. Financial Information Disclaimer</h2>
            <p>
              DeadlineZero provides calculations and estimates based on information you enter.
              These are for informational purposes only and should not be construed as financial
              advice. Specifically:
            </p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>
                Calculations depend entirely on the accuracy of data you provide. We are not
                responsible for errors resulting from incorrect input.
              </li>
              <li>
                Alert emails depend on reliable email delivery. We cannot guarantee delivery or
                timeliness of all alerts.
              </li>
              <li>
                Plaid balance syncs may not reflect real-time account data. Always verify balances
                with your financial institution before making payment decisions.
              </li>
              <li>
                DeadlineZero is not responsible for any financial losses, retroactive interest
                charges, or other damages resulting from reliance on our calculations or missed alerts.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Use the Service for any unlawful purpose or in violation of any regulations</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its systems</li>
              <li>Transmit viruses, malware, or other harmful code</li>
              <li>Scrape, crawl, or data-mine the Service without written permission</li>
              <li>Use the Service to collect or harvest personal information about other users</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by
              DeadlineZero and are protected by copyright, trademark, and other intellectual
              property laws. You may not copy, modify, distribute, or create derivative works
              without our express written consent.
            </p>
            <p>
              You retain ownership of the financial data you enter into the Service. By using the
              Service, you grant us a limited license to store and process that data solely to
              provide the Service to you.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">8. Termination</h2>
            <p>
              You may delete your account at any time by contacting us. Upon termination, your
              right to use the Service ceases immediately and your data will be deleted within 30 days.
            </p>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior
              notice, for conduct that we believe violates these Terms or is harmful to other users,
              us, or third parties.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, DeadlineZero and its officers, employees,
              and agents shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages, including but not limited to financial losses, data loss, or
              service interruptions, arising out of your use of or inability to use the Service.
            </p>
            <p>
              Our total liability to you for any claims arising from use of the Service shall not
              exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">10. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without any warranties of any
              kind, either express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to conflict of law principles. Any disputes shall be
              resolved through binding arbitration in accordance with the rules of the American
              Arbitration Association.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              material changes by email or by posting a notice on the Service. Continued use of
              the Service after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">13. Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@deadlinezero.com" className="text-[#3B82F6] hover:underline">
                legal@deadlinezero.com
              </a>.
            </p>
          </section>

          <div className="pt-4 border-t border-[#223661]">
            <Link href="/privacy" className="text-[#3B82F6] hover:underline text-[14px]">
              View Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
