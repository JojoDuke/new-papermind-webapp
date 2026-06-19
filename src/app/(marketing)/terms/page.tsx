import { LegalPageShell } from '@/components/marketing/LegalPageShell';
import { Metadata } from 'next';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata('/terms', {
  title: 'Terms of Service - Papermind',
  description: 'Terms and conditions for using Papermind.',
});

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated="May 22, 2026">
      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">1. Agreement to terms</h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and use of Papermind, operated by Bhyte Software
          Company (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account or using the Service, you agree to these Terms
          and our{' '}
          <a href="/privacy" className="text-[#FF5392] hover:underline">
            Privacy Policy
          </a>
          . If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">2. The Service</h2>
        <p>
          Papermind is an AI-assisted study platform that helps you turn uploaded materials into flashcards, quizzes,
          study guides, and related learning tools. Features may change over time; some capabilities may be labeled
          beta, coming soon, or available only on paid plans.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">3. Accounts</h2>
        <p>
          You must provide accurate registration information and keep your credentials secure. You are responsible
          for activity under your account. Notify us promptly at{' '}
          <a href="mailto:hello@usepapermind.app" className="text-[#FF5392] hover:underline">
            hello@usepapermind.app
          </a>{' '}
          if you suspect unauthorized access.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">4. Subscriptions and payments</h2>
        <p>
          Paid plans and billing intervals are described on our pricing page. Subscriptions renew
          automatically unless canceled before the renewal date. Fees are processed by our payment partner. Refunds
          are handled according to the policy displayed at checkout or required by applicable law. We may change
          pricing with reasonable notice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">5. Your content</h2>
        <p>
          You retain ownership of materials you upload. You grant us a limited license to host, process, and display
          your content solely to operate and improve the Service (including AI generation). You represent that you
          have the rights to upload your content and that it does not violate law or third-party rights.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">6. Acceptable use</h2>
        <p className="mb-3">You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the Service for unlawful, harmful, or fraudulent purposes</li>
          <li>Upload malware, scrape the Service without permission, or attempt to bypass access controls</li>
          <li>Reverse engineer or resell the Service except as permitted by law</li>
          <li>Harass other users or overload our systems through automated abuse</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">7. AI-generated output</h2>
        <p>
          AI-generated flashcards, quizzes, study guides, and other outputs are provided for study assistance only.
          They may contain errors or omissions. You are responsible for verifying accuracy before relying on them for
          exams, clinical, legal, or other high-stakes decisions. The Service does not constitute professional advice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">8. Intellectual property</h2>
        <p>
          Papermind branding, software, and design are owned by us or our licensors. Except for the limited rights
          expressly granted in these Terms, no rights are transferred to you.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">9. Disclaimer of warranties</h2>
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
          IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
          WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">10. Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BHYTE SOFTWARE COMPANY AND ITS AFFILIATES WILL NOT BE LIABLE FOR
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL.
          OUR TOTAL LIABILITY FOR CLAIMS ARISING FROM THE SERVICE IS LIMITED TO THE GREATER OF (A) AMOUNTS YOU PAID
          US IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS ($100).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">11. Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or terminate access if you violate these Terms
          or if required for security or legal reasons. Provisions that by nature should survive termination will survive.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">12. Governing law</h2>
        <p>
          These Terms are governed by the laws of the State of Delaware, United States, without regard to conflict-of-law
          principles, except where mandatory consumer protections in your country of residence apply.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">13. Contact</h2>
        <p>
          For questions about these Terms, contact{' '}
          <a href="mailto:hello@usepapermind.app" className="text-[#FF5392] hover:underline">
            hello@usepapermind.app
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
