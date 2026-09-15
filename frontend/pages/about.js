import Head from 'next/head';
import {
  ShieldCheck,
  Truck,
  Headphones,
  BadgePercent,
  RotateCcw,
  Heart,
} from 'lucide-react';

const VALUES = [
  {
    Icon: ShieldCheck,
    title: '100% genuine',
    desc: 'Every device is verified authentic. We source directly from authorized distributors.',
  },
  {
    Icon: Truck,
    title: 'Fast delivery',
    desc: 'Same-day delivery in Accra, 1–3 days nationwide across all Ghana regions.',
  },
  {
    Icon: Headphones,
    title: 'Real support',
    desc: 'WhatsApp support with real people, 8am–10pm, every day of the week.',
  },
  {
    Icon: BadgePercent,
    title: 'Fair prices',
    desc: 'Competitive prices with no hidden fees. What you see is what you pay.',
  },
  {
    Icon: RotateCcw,
    title: 'Easy returns',
    desc: '7-day hassle-free return policy. Your satisfaction is our top priority.',
  },
  {
    Icon: Heart,
    title: 'Made for Ghana',
    desc: 'Built by Ghanaians, for Ghanaians. We understand exactly what you need.',
  },
];

const STATS = [
  { num: '10,000+', label: 'Happy customers' },
  { num: '5+', label: 'Years in business' },
  { num: '148+', label: 'Products' },
  { num: '16', label: 'Regions served' },
];

export default function About() {
  return (
    <>
      <Head>
        <title>About — AlphaiStore</title>
        <meta
          name="description"
          content="Ghana's most trusted phone store."
        />
      </Head>

      {/* Hero */}
      <section className="bg-white border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink">
            Our story
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tightish text-ink leading-tight">
            Ghana's most trusted phone store
          </h1>
          <p className="mt-5 text-base md:text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            AlphaiStore was founded in Kumasi with one mission: make it easy for
            every Ghanaian to own a great smartphone at a fair price.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Story */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tightish text-ink mb-4">
            Our story
          </h2>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed mb-3">
            We started as a small shop in Kumasi and have grown to serve
            customers across all regions of Ghana. What began as a dream to make
            quality smartphones accessible to everyone has become one of Ghana's
            most trusted online phone stores.
          </p>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Every phone we sell is verified genuine, and we back every sale with
            our 7-day return policy and dedicated WhatsApp support.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-surface-border bg-white p-6 text-center"
            >
              <p className="text-2xl font-semibold text-ink">{s.num}</p>
              <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Values */}
        <section>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tightish text-ink">
              Our values
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              What guides everything we do at AlphaiStore.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VALUES.map(({ Icon, title, desc }) => (
              <article
                key={title}
                className="rounded-2xl border border-surface-border bg-white p-6"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-50 text-ink">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink-muted leading-relaxed">
                  {desc}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}