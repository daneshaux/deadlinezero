import Link from 'next/link'
import { SiteNav } from '@/components/layout/site-nav'

export const metadata = {
  title: 'Privacy Policy — DeadlineZero',
  description: 'How DeadlineZero collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-[#0B1020]">
      <SiteNav />

      <main className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 lg:py-16">
        <div className="flex flex-col gap-3 mb-10">
          <h1 className="text-[32px] font-bold text-white">Privacy Policy</h1>
          <p className="text-[14px] font-normal text-[#A1B7E7]/60">Last updated: June 2026</p>
        </div>

        <div className="flex flex-col gap-8 text-[16px] font-normal text-[#A1B7E7] leading-relaxed">

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">1. Introduction</h2>
            <p>
              DeadlineZero (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your personal
              information. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our service at deadlinezero.com.
            </p>
            <p>
              By using DeadlineZero, you agree to the collection and use of information in accordance
              with this policy. If you do not agree, please discontinue use of the service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>
                <span className="text-white font-semibold">Account information:</span> Your email
                address and name when you sign in via Google OAuth or magic link.
              </li>
              <li>
                <span className="text-white font-semibold">Financial deal data:</span> Information you
                voluntarily enter about your deferred-interest deals, including merchant names, loan
                amounts, balances, APRs, and promotional deadlines.
              </li>
              <li>
                <span className="text-white font-semibold">Payment information:</span> Billing details
                processed by Stripe when you subscribe to a paid plan. We do not store full card
                numbers — Stripe handles payment processing.
              </li>
              <li>
                <span className="text-white font-semibold">Bank connection data (Premium):</span> If
                you connect a bank account via Plaid, we store an encrypted access token to sync your
                balances. We do not store your bank credentials.
              </li>
              <li>
                <span className="text-white font-semibold">Usage data:</span> Standard server logs
                including IP addresses, browser type, pages visited, and timestamps.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Provide, operate, and maintain the DeadlineZero service</li>
              <li>Send deadline alert emails and payment reminders you have opted into</li>
              <li>Process subscription payments and manage your account</li>
              <li>Sync your financial account balances (with your explicit authorization via Plaid)</li>
              <li>Improve and personalize the service</li>
              <li>Communicate service updates and security notices</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">4. Data Sharing</h2>
            <p>We share your information only with the following trusted third-party services necessary to operate DeadlineZero:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li><span className="text-white font-semibold">Supabase</span> — database hosting</li>
              <li><span className="text-white font-semibold">Stripe</span> — payment processing</li>
              <li><span className="text-white font-semibold">Plaid</span> — bank account connection (Premium only)</li>
              <li><span className="text-white font-semibold">Resend</span> — transactional email delivery</li>
              <li><span className="text-white font-semibold">Vercel</span> — application hosting</li>
              <li><span className="text-white font-semibold">Google</span> — OAuth sign-in (optional)</li>
            </ul>
            <p>
              We may disclose your information if required by law, court order, or to protect the
              rights and safety of DeadlineZero users.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including
              encryption at rest and in transit, row-level security on our database, and encrypted
              storage of any third-party access tokens. However, no method of transmission over the
              internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide the
              service. You may delete your account at any time by contacting us, which will permanently
              delete your deal data and personal information within 30 days.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside flex flex-col gap-2 pl-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of non-essential marketing communications</li>
              <li>Disconnect your bank account (Plaid) at any time</li>
            </ul>
            <p>
              To exercise these rights, reach out to Danesha directly at{' '}
              <a href="mailto:daneshayvette@gmail.com" className="text-[#3B82F6] hover:underline">
                daneshayvette@gmail.com
              </a>.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">8. Cookies</h2>
            <p>
              We use session cookies to keep you signed in and to remember your preferences.
              We do not use advertising or tracking cookies. You can disable cookies in your browser
              settings, though this may affect your ability to use the service.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">9. Children&apos;s Privacy</h2>
            <p>
              DeadlineZero is not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children. If you believe a child has provided us with
              personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the &ldquo;Last updated&rdquo; date.
              Continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[20px] font-bold text-white">11. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact Danesha at{' '}
              <a href="mailto:daneshayvette@gmail.com" className="text-[#3B82F6] hover:underline">
                daneshayvette@gmail.com
              </a>.
            </p>
          </section>

          <div className="pt-4 border-t border-[#223661]">
            <Link href="/terms" className="text-[#3B82F6] hover:underline text-[14px]">
              View Terms of Service &rarr;
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
