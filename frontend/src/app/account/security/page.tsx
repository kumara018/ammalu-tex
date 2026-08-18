'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { performLogout } from '@/lib/auth';
import { Details, Password, Devices, SubPage } from '@/components/account/Sections';

/**
 * Sign-in & security — the one page a password form belongs on.
 *
 * Amazon calls this "Login & security" and puts name, contact details,
 * password and devices on it together, which is right: they are the four
 * things that decide who can act as you. Nothing here is shown to somebody
 * who came to check an order.
 */
export default function SecurityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/auth/login');
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <SubPage
      title="Sign-in &amp; security"
      note="Who you are to us, and who can sign in as you."
    >
      <div className="flex flex-col gap-14">
        <section id="details" className="scroll-mt-28">
          <h2 className="font-display text-[1.4rem] leading-tight text-graphite">Your details</h2>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-graphite-muted">
            The name and number we use on an order and on a delivery.
          </p>
          <div className="mt-7"><Details /></div>
        </section>

        <section className="border-t border-paper-edge pt-10">
          <h2 className="font-display text-[1.4rem] leading-tight text-graphite">Password</h2>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-graphite-muted">
            Change it whenever you like — you will need the current one. If you have
            forgotten it, sign out and use &ldquo;Forgotten password&rdquo; instead.
          </p>
          <div className="mt-7"><Password /></div>
        </section>

        <section className="border-t border-paper-edge pt-10">
          <h2 className="font-display text-[1.4rem] leading-tight text-graphite">Where you are signed in</h2>
          <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-graphite-muted">
            You can stay signed in on up to four devices at once. If you see one you do
            not recognise, sign it out and change your password.
          </p>
          <div className="mt-7"><Devices onSignOutSelf={() => performLogout()} /></div>
        </section>
      </div>
    </SubPage>
  );
}
