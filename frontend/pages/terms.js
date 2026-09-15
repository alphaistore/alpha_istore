import Head from 'next/head';

export default function TermsOfService() {
  return (
    <>
      <Head>
        <title>Terms of Service — AlphaiStore</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-ink mb-6">Terms of Service</h1>
        <p className="text-sm text-ink-muted mb-8">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none text-sm text-ink-muted space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-ink">1. Acceptance of Terms</h2>
            <p>By accessing and using AlphaiStore, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">2. Products and Pricing</h2>
            <p>All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We strive to display accurate pricing, but errors may occur.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">3. Orders and Payments</h2>
            <p>By placing an order, you agree to provide accurate billing and shipping information. Payment must be received before order processing. We accept MTN MoMo, Telecel Cash, AirtelTigo Money, debit/credit cards, and cash on delivery.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">4. Delivery</h2>
            <p>Delivery times are estimates and not guaranteed. We are not liable for delays caused by courier services or circumstances beyond our control.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">5. Returns and Refunds</h2>
            <p>Returns are accepted within 7 days of delivery for items in original condition. Refunds will be processed within 5–10 business days after we receive the returned item.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">6. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">7. Limitation of Liability</h2>
            <p>AlphaiStore shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-ink">8. Contact Us</h2>
            <p>For questions about these Terms, please reach out via our <a href="/contact" className="text-ink hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
    </>
  );
}
