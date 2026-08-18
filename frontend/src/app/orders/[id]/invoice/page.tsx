'use client';
import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ordersAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Download, Mail, Share2, Printer } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { STORE } from '@/lib/config';
import { mediaUrl } from '@/lib/media';

const PAY_LABEL: Record<string, string> = {
  razorpay: 'Online Payment (Razorpay)',
  upi:      'UPI Payment',
  cod:      'Cash on Delivery',
};

const PAY_STATUS_COLOR: Record<string, string> = {
  paid:     'text-green-700 bg-green-50 border-green-300',
  pending:  'text-amber-700  bg-amber-50  border-amber-300',
  refunded: 'text-purple-700 bg-purple-50 border-purple-300',
};

function InvoiceContent() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    ordersAPI.getOne(Number(id))
      .then(r => setOrder(r.data))
      .catch(() => router.push('/orders'))
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

  const handlePrint = () => window.print();

  const handleEmail = async () => {
    setSending(true);
    try {
      await ordersAPI.sendInvoice(Number(id));
      toast.success('Invoice sent to your email! 📧');
    } catch {
      toast.error('Failed to send invoice. Please try again.');
    } finally { setSending(false); }
  };

  const handleWhatsApp = () => {
    const url = encodeURIComponent(`${window.location.origin}/orders/${id}/invoice`);
    const msg = encodeURIComponent(
      `📄 *Invoice — ${order?.order_number}*\nAmmalu Tex · Premium Women's Textiles\nView invoice: ${window.location.origin}/orders/${id}/invoice`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-graphite/15 rounded w-48" />
      <div className="h-[600px] bg-graphite/15 rounded-none" />
    </div>
  );

  if (!order) return null;

  const addr = order.shipping_address as any;
  const pm   = (order.payment_method || 'cod').toLowerCase();
  const txn  = order.payment_transaction_id || '';
  const isCod = pm === 'cod';
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Action bar — hidden on print */}
      <div className="print:hidden mb-6 flex items-center gap-3 flex-wrap">
        <Link href={`/orders/${id}`} className="flex items-center gap-1.5 text-sm text-graphite/70 hover:text-graphite font-medium">
          <ArrowLeft size={16} /> Back to Order
        </Link>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button onClick={handleEmail} disabled={sending}
            className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none font-medium transition-colors disabled:opacity-60">
            <Mail size={15} /> {sending ? 'Sending...' : 'Email Invoice'}
          </button>
          <button onClick={handleWhatsApp}
            className="flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-none font-medium transition-colors">
            <Share2 size={15} /> WhatsApp
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-sm bg-maroon-800 hover:bg-maroon-900 text-white px-4 py-2 rounded-none font-medium transition-colors">
            <Download size={15} /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      {/**
        * AN INVOICE IS A PRINTED DOCUMENT, AND THAT DECIDES EVERYTHING HERE.
        *
        * It is the one page on this site that leaves the screen. It gets
        * printed on a cheap inkjet, saved as a PDF, attached to an email,
        * filed for tax, and read a year later by somebody who has never seen
        * the shop. So it is NOT designed like the rest of the site, and that
        * is deliberate rather than neglect:
        *
        *   NEAR-BLACK ON WHITE. Not the paper ground, not graphite on muslin.
        *   A tinted background costs a customer real ink and greys out on a
        *   fax or a photocopy. White is the only ground a document can count
        *   on.
        *
        *   NO GRADIENT, NO SHADOW, NO ROUNDED CARD. A maroon-to-maroon
        *   gradient masthead and a gold divider strip — which is what this had
        *   — print as a solid band of muddy ink, and `print:shadow-none` was
        *   already admitting the shadow was wrong. Rules print. Fills do not.
        *
        *   THE MARK, IN INK. The stamp identifies the document at a glance in
        *   a folder of forty. It is the one piece of the shop's design that
        *   belongs here, and it works in one colour.
        *
        * What it keeps from the site is the type: the display face on the
        * figures that matter, letter-spaced small caps on the labels. That is
        * what makes it recognisably from this shop without costing anything at
        * the printer.
        */}
      <div id="invoice" className="border border-graphite/25 bg-white">

        {/* ── The masthead ── */}
        <div className="border-b border-graphite/25 px-8 pb-7 pt-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark size={40} className="flex-shrink-0 text-graphite" />
                <p className="font-display text-[1.5rem] leading-none text-graphite">
                  {STORE.name}
                </p>
              </div>
              <div className="mt-4 text-[11px] leading-relaxed text-graphite">
                <p>{STORE.shopNo}</p>
                <p>{STORE.area}, {STORE.city}, {STORE.state} {STORE.pincode}</p>
                <p>{STORE.phone1} &nbsp;·&nbsp; {STORE.email}</p>
              </div>
            </div>

            {/* The document's own identity, as a definition list — the two
                things a filed invoice is looked up by. */}
            <dl className="text-right">
              <dt className="text-[10px] uppercase tracking-[0.18em] text-graphite/60">Tax invoice</dt>
              <dd className="mt-1.5 font-display text-[1.35rem] leading-none tabular-nums text-graphite">
                {order.order_number}
              </dd>
              <dt className="mt-4 text-[10px] uppercase tracking-[0.18em] text-graphite/60">Dated</dt>
              <dd className="mt-1.5 text-[12px] tabular-nums text-graphite">{date}</dd>
            </dl>
          </div>
        </div>

        <div className="px-8 py-7 space-y-6">

          {/* ── Customer + Shipping ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-transparent border border-maroon-100 rounded-none p-4">
              <p className="text-xs font-normal text-graphite uppercase tracking-wider mb-3">Bill To</p>
              <p className="font-normal text-graphite">{user?.full_name}</p>
              <p className="text-sm text-graphite/70 mt-0.5">{user?.email}</p>
              <p className="text-sm text-graphite/70">{user?.phone}</p>
            </div>
            <div className="bg-transparent border border-graphite/20 rounded-none p-4">
              <p className="text-xs font-normal text-orange-700 uppercase tracking-wider mb-3">Ship To</p>
              <p className="font-normal text-graphite">{addr.full_name}</p>
              <p className="text-sm text-graphite/70 mt-0.5">{addr.address_line1}</p>
              {addr.address_line2 && <p className="text-sm text-graphite/70">{addr.address_line2}</p>}
              <p className="text-sm text-graphite/70">{addr.city}, {addr.state} — {addr.pincode}</p>
              <p className="text-sm text-graphite/70">📞 {addr.phone}</p>
            </div>
          </div>

          {/* ── Items Table ── */}
          <div className="overflow-x-auto rounded-none border border-graphite/15">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-maroon-800 text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items_snapshot as any[]).map((item, i) => {
                  const imgSrc = item.image
                    ? (mediaUrl(item.image))
                    : null;
                  const emoji = item.category === 'Lehenga' ? '👗' : item.category === 'Chudithar' ? '👘' : item.category === 'Half Saree' ? '🥻' : '👚';
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-transparent'}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-none bg-transparent flex items-center justify-center text-lg flex-shrink-0 overflow-hidden border border-graphite/20">
                            {imgSrc
                              ? <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display='none'; }} />
                              : <span>{emoji}</span>}
                          </div>
                          <div>
                            <p className="font-semibold text-graphite">{item.name}</p>
                            <p className="text-xs text-graphite/50 mt-0.5">
                              Product ID: #{item.product_id}
                              {item.size ? ` · Size: ${item.size}` : ''}
                              {item.color ? ` · Colour: ${item.color}` : ''}
                            </p>
                            <p className="text-xs text-graphite/50">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-semibold">{item.quantity}</td>
                      <td className="px-4 py-4 text-right text-graphite">₹{Number(item.price).toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-normal text-graphite">₹{Number(item.subtotal).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Totals ── */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-graphite/70">
                <span>Subtotal</span>
                <span className="font-medium">₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-graphite/70">
                <span>Shipping</span>
                <span className={`font-medium ${order.shipping_fee === 0 ? 'text-green-600' : ''}`}>
                  {order.shipping_fee === 0 ? 'FREE' : `₹${order.shipping_fee}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">-₹{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t-2 border-graphite/20 pt-3 flex justify-between font-normal text-lg">
                <span className="text-graphite">Grand Total</span>
                <span className="text-graphite">₹{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ── Payment Details ── */}
          <div className="bg-blue-50 border border-blue-100 rounded-none p-5">
            <p className="text-xs font-normal text-blue-700 uppercase tracking-wider mb-3">Payment Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-graphite/60 text-xs mb-1">Mode of Payment</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCod ? '💵' : '💳'}</span>
                  <span className="font-semibold text-graphite">{PAY_LABEL[pm] || pm.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <p className="text-graphite/60 text-xs mb-1">Payment Status</p>
                <span className={`inline-block text-xs font-normal px-3 py-1 rounded-none border ${PAY_STATUS_COLOR[order.payment_status] || 'text-graphite/70 bg-white border-graphite/20'}`}>
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
              {!isCod && txn && (
                <div className="sm:col-span-2">
                  <p className="text-graphite/60 text-xs mb-1">Transaction ID</p>
                  <p className="font-mono text-xs bg-white border border-graphite/20 rounded-none px-3 py-2 text-graphite break-all">{txn}</p>
                </div>
              )}
              {isCod && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-none px-3 py-2">
                    Cash on Delivery — Payment collected at the time of delivery.
                  </p>
                </div>
              )}
              {order.payment_status === 'refunded' && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-none px-3 py-2">
                    Refund initiated — Amount will be credited within 5–7 business days.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Order Status ── */}
          <div className="flex items-center justify-between flex-wrap gap-3 py-3 border-t border-graphite/15">
            <div className="flex items-center gap-2 text-sm text-graphite/70">
              <span>Order Status:</span>
              <span className={`font-normal capitalize px-3 py-1 rounded-none text-xs border
                ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-300' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-300' :
                  'bg-blue-50 text-blue-700 border-blue-300'}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-graphite/50">Invoice generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="bg-gradient-to-r from-maroon-900 to-maroon-800 px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <LogoMark size={30} className="text-white flex-shrink-0" />
              <div>
                <p className="text-white font-normal uppercase" style={{ letterSpacing: '0.03em' }}>Ammalu Tex</p>
                <p className="text-white/60 text-xs">Shop Ground Floor No 129, Texvalley Gangapuram</p>
                <p className="text-white/60 text-xs">ammalutex.com · support@ammalutex.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs">Thank you for shopping with us! 🛍️</p>
              <p className="text-gold-300 text-xs font-medium mt-1">© {new Date().getFullYear()} Ammalu Tex. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice { position: fixed; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-graphite/15 rounded w-48" />
        <div className="h-[600px] bg-graphite/15 rounded-none" />
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
}
