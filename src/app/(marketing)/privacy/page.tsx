import { LegalPageShell } from '@/components/marketing/LegalPageShell';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Papermind',
  description: 'How Papermind collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated="May 22, 2026">
      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">1. Introduction</h2>
        <p>
          Papermind (&quot;Papermind,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is operated by Bhyte Software Company.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
          our website and study platform at usepapermind.app and related services (collectively, the &quot;Service&quot;).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">2. Information we collect</h2>
        <p className="mb-3">We may collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-gray-800">Account information:</strong> name, email address, and authentication
            credentials when you sign up (including via Google OAuth).
          </li>
          <li>
            <strong className="text-gray-800">Study content:</strong> documents, notes, and other materials you upload
            to generate flashcards, quizzes, study guides, and related learning assets.
          </li>
          <li>
            <strong className="text-gray-800">Usage data:</strong> study sessions, progress metrics, feature interactions,
            and technical logs (IP address, browser type, device information) used to operate and improve the Service.
          </li>
          <li>
            <strong className="text-gray-800">Payment information:</strong> subscription and billing details are processed
            by our payment provider (Polar). We do not store full payment card numbers on our servers.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">3. How we use your information</h2>
        <p className="mb-3">We use collected information to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, maintain, and personalize the Service</li>
          <li>Process AI-generated study materials from your uploaded content</li>
          <li>Track learning progress and sync your account across devices</li>
          <li>Process subscriptions, send transactional emails, and provide customer support</li>
          <li>Monitor security, prevent abuse, and comply with legal obligations</li>
          <li>Analyze aggregated usage to improve product quality (where analytics are enabled)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">4. AI and third-party services</h2>
        <p>
          To deliver core features, we use trusted infrastructure and AI providers (including Convex for data storage,
          authentication, and backend functions, and model providers for content generation). Your uploaded materials
          may be processed by these services solely to provide the functionality you request. We do not sell your
          study documents or personal data to third parties for their marketing purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">5. Data retention and security</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide the Service,
          comply with law, resolve disputes, and enforce our agreements. We implement reasonable administrative,
          technical, and organizational safeguards designed to protect your data. No method of transmission over
          the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">6. Your rights and choices</h2>
        <p>
          Depending on your location, you may have rights to access, correct, delete, or export your personal data,
          or to object to certain processing. You may update account details in your dashboard settings (where available)
          or contact us to request account deletion. You can opt out of non-essential marketing emails via unsubscribe
          links where provided.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">7. Children&apos;s privacy</h2>
        <p>
          The Service is not directed to children under 13 (or the minimum age required in your jurisdiction).
          We do not knowingly collect personal information from children. If you believe a child has provided us
          personal data, please contact us so we can delete it.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">8. International users</h2>
        <p>
          If you access the Service from outside the United States, your information may be transferred to and
          processed in countries where our providers operate. By using the Service, you consent to such transfers
          subject to applicable law.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version on this page and
          update the &quot;Last updated&quot; date. Material changes may be communicated via email or in-app notice.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">10. Contact us</h2>
        <p>
          Questions about this Privacy Policy? Email{' '}
          <a href="mailto:hello@usepapermind.app" className="text-[#FF5392] hover:underline">
            hello@usepapermind.app
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  );
}
