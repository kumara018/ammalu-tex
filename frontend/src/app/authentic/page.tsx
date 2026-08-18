import Link from 'next/link';
import MeasureRule from '@/components/home/MeasureRule';
import {
  Shield, CheckCircle, Award,
  ChevronRight, Headphones, Truck,
} from 'lucide-react';

export const metadata = {
  title: '100% Authentic Products — Ammalu Tex',
  description: 'Every product at Ammalu Tex is sourced directly from trusted weavers and manufacturers. Guaranteed authentic.',
};

export default function AuthenticPage() {
  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 py-[clamp(3rem,9vh,6rem)] sm:px-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-graphite-faint mb-6">
        <Link href="/" className="hover:text-graphite-muted">Home</Link>
        <ChevronRight size={12} />
        <span className="text-graphite font-medium">100% Authentic</span>
      </nav>

      {/* Header */}
      <div className="mb-[clamp(2.5rem,7vh,4.5rem)]">
        <p className="mb-4 text-rule uppercase text-thread">Our word</p>
        <h1 className="font-display text-chapter font-normal text-graphite">100% authentic</h1>
        <p className="mt-6 max-w-[54ch] text-lede text-graphite-muted">
          Every garment at Ammalu Tex is handpicked from verified weavers, manufacturers, and trusted suppliers.
          We guarantee genuine quality — no imitations, no compromises.
        </p>
      </div>

      {/**
        * WHAT WAS HERE. A brown gradient panel, white centred text, a 20px
        * circle holding a shield icon, and a 180px shield emoji washed behind
        * it at 5% opacity. Four devices saying the same thing, none of them
        * saying it in this shop's voice.
        *
        * A guarantee is a sentence someone stands behind. So it is set as one,
        * at the size the claim deserves, with the shop's name under it the way
        * a signature sits under a statement.
        */}
      <figure className="mb-[clamp(3rem,10vh,7rem)] border-y border-paper-edge py-[clamp(2.5rem,7vh,4.5rem)]">
        <blockquote className="max-w-[24ch] font-display text-chapter font-normal leading-[1.06] text-graphite">
          What you see is exactly what you get.
        </blockquote>
        <figcaption className="mt-7 max-w-[52ch] text-lede text-graphite-muted">
          We source directly from weavers across Tamil Nadu and trusted textile hubs,
          bypassing middlemen — which is why the price is what it is and the cloth
          is what we say it is.
        </figcaption>
      </figure>

      {/* Six checks, numbered because they happen in this order — from the
          weaver to the label. An emoji in a bordered card said none of that. */}
      <h2 className="mb-2 font-display text-band font-normal text-graphite">Our quality promise</h2>
      <MeasureRule className="mb-2" />
      <div className="mb-[clamp(3rem,10vh,7rem)]">
        {[
          { title: 'Direct from weavers',    desc: 'We work directly with skilled weavers and manufacturers in Tamil Nadu and major textile hubs across India — no middlemen, no markups.' },
          { title: 'Every piece inspected',  desc: 'Each garment is checked before it reaches the shop: fabric, stitching, colour fastness, finishing.' },
          { title: 'True-to-photo colours',  desc: 'We photograph in natural light so the colour you see is the colour that arrives. Slight screen variation is normal.' },
          { title: 'Accurate sizing',        desc: 'Our size guide is calibrated against actual garment measurements — inches and centimetres — not generic standards.' },
          { title: 'Genuine fabrics',        desc: 'Cotton, silk, georgette, crepe — every fabric is sourced from certified suppliers and labelled accurately on the product page.' },
          { title: 'Ethical sourcing',       desc: 'We support local artisans and fair trade. Shopping here supports real craftspeople and their livelihoods.' },
        ].map(({ title, desc }, i) => (
          <div
            key={title}
            className="grid grid-cols-[auto_1fr] items-baseline gap-x-6 border-b border-paper-edge py-7 sm:gap-x-10"
          >
            <span className="text-rule uppercase tabular-nums text-thread">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="grid gap-y-2 lg:grid-cols-[minmax(0,24ch)_minmax(0,1fr)] lg:items-baseline lg:gap-x-10">
              <h3 className="font-display text-band font-normal text-graphite">{title}</h3>
              <p className="max-w-[58ch] text-lede text-graphite-muted">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quality checks */}
      <h2 className="mb-6 font-display text-band font-normal text-graphite">What we check before it leaves</h2>
      <div className="card p-6 mb-10">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Fabric composition matches product description',
            'No loose threads or stitching defects',
            'Colour matches the product photo',
            'Correct sizing as per our size guide',
            'Embroidery / embellishments are secure',
            'Zippers, buttons, and hooks function properly',
            'No stains or damage from storage',
            'Proper ironing and presentation',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 text-sm text-graphite-muted">
              <CheckCircle size={15} className="text-green-500 flex-shrink-0" /> {item}
            </div>
          ))}
        </div>
      </div>

      {/* Not happy? */}
      <div className="card p-6 mb-10 bg-maroon-50 border-maroon-200">
        <p className="font-normal text-graphite mb-2 flex items-center gap-2">
          <Award size={18} className="text-gold-600" /> Not Satisfied? We'll Make It Right.
        </p>
        <p className="text-sm text-graphite-muted leading-relaxed mb-3">
          If a product arrives with a genuine size issue or damage, you can request a{' '}
          <strong>return within 4 hours of delivery</strong> — once approved and picked up, your refund is
          processed automatically via Razorpay.
        </p>
        <Link href="/support#returns" className="text-sm font-semibold text-graphite-muted hover:underline">
          Read Cancellation, Return & Exchange Policy →
        </Link>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products" className="btn-primary flex items-center gap-2 justify-center">
          <Shield size={16} /> Shop Authentic Products
        </Link>
        <Link href="/shipping" className="btn-outline flex items-center gap-2 justify-center text-maroon-800 border-maroon-300 hover:bg-maroon-50">
          <Truck size={15} /> Shipping Info
        </Link>
        <Link href="/support" className="flex items-center gap-2 justify-center px-5 py-2.5 rounded-sm border border-paper-edge text-graphite-muted hover:bg-paper text-sm font-medium">
          <Headphones size={15} /> Need Help?
        </Link>
      </div>

    </div>
  );
}
