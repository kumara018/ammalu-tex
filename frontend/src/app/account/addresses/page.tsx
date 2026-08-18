'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Addresses, SubPage } from '@/components/account/Sections';

/**
 * Saved addresses.
 *
 * The backend has had add / update / remove / set-default the whole time and
 * no page ever called any of it — the old tile pointed at `/account#addr`, an
 * anchor no element on the page carried. This is that feature finally having
 * somewhere to live.
 */
export default function AddressesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/auth/login');
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <SubPage
      title="Saved addresses"
      note="Somewhere to send an order without typing it out again. The usual one is filled in for you at checkout."
    >
      <Addresses />
    </SubPage>
  );
}
