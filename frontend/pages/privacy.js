import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — AlphaiStore</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-6">Privacy Policy</h1>
        <p className="text-sm text-ink-muted mb-8">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-ink-muted space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-ink">1. Information We Collect</h2>
            <p>We collect information you provide directly when creating an account, placing an order, or contacting us. This includes your name, email address, phone number, and delivery address.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">2. How We Use Your Information</h2>
            <p>Your information is used to process orders, send order confirmations, provide customer support, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">3. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information. Your password is encrypted using bcrypt, and all data transmissions are secured via HTTPS.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">4. Cookies</h2>
            <p>We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can disable cookies in your browser settings.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us at info@alphaistore.com to exercise these rights.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please reach out via our <a href="/contact" className="text-ink hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
    </>
  );
}
