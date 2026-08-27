import { describe, it, expect } from 'vitest';
import { isMoneyAtRisk, type Outcome } from '@/app/checkout/PaymentOutcome';
import { sceneForPath, isRestrained } from '@/store/useSceneStore';
import { nextHistory, withoutTerm, LIMIT } from '../searchHistory';

/**
 * Tests for the logic where being wrong costs money or misleads a customer.
 *
 * This shop had no frontend test suite at all — the other shop has had one for
 * a while, so every regression caught automatically over there reached
 * customers over here. Rather than open with a broad shallow suite, this
 * covers the handful of PURE functions whose failure modes are real: a payment
 * state that tells somebody to retry when their money has already moved, a
 * route→scene map that decides what renders on checkout, and the search
 * history rules.
 *
 * Deliberately not tested here: anything needing a browser, a GPU or the
 * network. Asserting those against jsdom is how you get a passing test and a
 * broken page.
 */

describe('isMoneyAtRisk — the question a customer is actually asking', () => {
  /**
   * The whole point of the Outcome type is that "payment failed" is five
   * different facts about the customer's money. Getting this wrong in the SAFE
   * direction shows a scary warning after a clean decline; getting it wrong in
   * the UNSAFE direction invites a second charge on top of a first that
   * already succeeded. Only the second is a disaster, but both are bugs.
   */
  it('is false when nothing was charged', () => {
    expect(isMoneyAtRisk({ kind: 'dismissed' })).toBe(false);
    expect(isMoneyAtRisk({ kind: 'offline' })).toBe(false);
  });

  it('is false for a decline — the bank refused, so no money moved', () => {
    const declined: Outcome = { kind: 'declined', description: 'insufficient funds' };
    expect(isMoneyAtRisk(declined)).toBe(false);
  });

  it('is true when the signature could not be confirmed', () => {
    // The charge may well have succeeded. Not knowing is exactly the risk.
    expect(isMoneyAtRisk({ kind: 'unverified', paymentId: 'pay_123' })).toBe(true);
  });

  it('is true when the payment landed and the order did not save', () => {
    expect(isMoneyAtRisk({ kind: 'orphaned', paymentId: 'pay_456' })).toBe(true);
  });

  it('treats a payment id as irrelevant to safety', () => {
    // A declined attempt can carry a payment id too. The KIND decides, never
    // the presence of an id — that distinction is what stops a decline from
    // being dressed up as a possible charge.
    const declinedWithId: Outcome = {
      kind: 'declined', description: 'card declined', paymentId: 'pay_789',
    };
    expect(isMoneyAtRisk(declinedWithId)).toBe(false);
  });
});

describe('search history', () => {
  it('puts the newest term first', () => {
    expect(nextHistory(['saree'], 'kurta')).toEqual(['kurta', 'saree']);
  });

  it('moves a repeated search back to the front instead of duplicating it', () => {
    // Searching the same thing again is the strongest signal it is still what
    // somebody is looking for.
    expect(nextHistory(['kurta', 'saree'], 'saree')).toEqual(['saree', 'kurta']);
  });

  it('de-duplicates without regard to case', () => {
    expect(nextHistory(['Saree'], 'saree')).toEqual(['saree']);
  });

  it('ignores a term too short to be worth keeping', () => {
    const before = ['saree'];
    expect(nextHistory(before, 'a')).toBe(before);
    expect(nextHistory(before, '  ')).toBe(before);
  });

  it('never grows past the limit', () => {
    let list: string[] = [];
    for (let i = 0; i < LIMIT + 5; i++) list = nextHistory(list, `term${i}`);
    expect(list).toHaveLength(LIMIT);
    expect(list[0]).toBe(`term${LIMIT + 4}`);
  });

  it('removes one line and leaves the rest', () => {
    // The private case — one entry somebody would rather not see suggested —
    // must not cost them the whole list.
    expect(withoutTerm(['kurta', 'saree', 'silk'], 'saree')).toEqual(['kurta', 'silk']);
  });
});

describe('sceneForPath — what renders where', () => {
  /**
   * This shop deliberately has no per-route scene any more: the WebGL engine
   * was replaced by a CSS composition that runs on every device, so the map
   * returns the same restrained scene whatever the path.
   *
   * That is worth pinning rather than skipping. The three/ tree is still in
   * the repo, and returning a real scene from here is all it takes to bring
   * the engine back — at which point checkout could silently acquire a
   * cinematic backdrop competing with the payment form. These assertions fail
   * the moment that happens.
   */
  it('restrains checkout, where nothing may compete with the form', () => {
    expect(isRestrained(sceneForPath('/checkout'))).toBe(true);
  });

  it('restrains the sign-in routes', () => {
    expect(isRestrained(sceneForPath('/auth/login'))).toBe(true);
  });

  it('restrains the shop front too — the map is path-independent by design', () => {
    expect(isRestrained(sceneForPath('/'))).toBe(true);
    expect(sceneForPath('/')).toBe(sceneForPath('/checkout'));
  });
});
