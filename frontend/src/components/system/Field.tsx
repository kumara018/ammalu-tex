'use client';

import { forwardRef, useId, useState, type ComponentProps, type ReactNode } from 'react';

/**
 * A labelled text field, and the step frame the auth flow moves between.
 *
 * The accessibility here is the substance, not decoration:
 *
 *  - A real <label> bound by id. Placeholders are not labels — they vanish the
 *    moment someone types, which is exactly when a person checking what they
 *    are filling in needs them.
 *  - `aria-invalid` and `aria-describedby` wire the error to the field, so a
 *    screen reader reads the problem when focus lands rather than leaving it
 *    as unassociated red text elsewhere on screen.
 *  - The error is `role="alert"`, because it appears in response to an action
 *    and nothing navigated.
 *  - Focus is always visible, offset so the ring is not clipped by the border.
 *
 * A PASSWORD FIELD GETS A REVEAL, AUTOMATICALLY. Every password input in this
 * shop goes through here — sign in, register, reset — so the affordance is
 * built in once rather than remembered three times. Somebody typing a password
 * they cannot see on a phone keyboard, with autocorrect and a shifted layout,
 * is guessing; the commonest reason a correct password comes back "wrong" is a
 * character nobody could check.
 *
 * The mark is an eye. That is not the place to be inventive — the control's
 * whole value is being recognised in under a second by someone already
 * slightly frustrated. What belongs to this shop is how it is DRAWN: closed,
 * the eye is a running stitch, the same dashed line as the stamp in the rail
 * (components/Logo.tsx), as though it had been tacked shut; open, the stitch
 * is pulled and the line runs solid around a pupil. The sister shop draws its
 * own with lashes and a continuous lid, because it is a different shop.
 */
export const Field = forwardRef<
  HTMLInputElement,
  ComponentProps<'input'> & { label: string; error?: string; hint?: ReactNode }
>(function Field({ label, error, hint, className = '', type, ...rest }, ref) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);
  /* The type is swapped rather than the value copied anywhere, so the browser's
     own password manager keeps treating this as a password field. */
  const effectiveType = isPassword && revealed ? 'text' : type;

  return (
    <div>
      <label htmlFor={id} className="block text-rule uppercase text-graphite-faint">
        {label}
      </label>
      <div className="relative">
      <input
        {...rest}
        type={effectiveType}
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={[error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined}
        className={`mt-2.5 w-full border-b bg-transparent pb-2.5 text-lg text-graphite placeholder:text-graphite-faint/50 transition-colors duration-500 motion-reduce:transition-none focus:outline-none focus-visible:border-thread ${isPassword ? 'pr-11' : ''} ${
          error ? 'border-thread' : 'border-paper-edge focus:border-paper-faint'
        } ${className}`}
      />
      {isPassword && (
        /* `type="button"` matters: inside a form a bare <button> submits, so
           revealing the password would post the half-filled form. */
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-pressed={revealed}
          aria-controls={id}
          aria-label={revealed ? 'Hide password' : 'Show password'}
          title={revealed ? 'Hide password' : 'Show password'}
          className={`absolute bottom-3 right-0 transition-colors duration-500 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-thread ${
            revealed ? 'text-thread' : 'text-graphite-muted hover:text-thread'
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            {/* One almond, two thread states. Tacked shut it is a running
                stitch — the stamp's own dash pattern; pulled open the line
                runs solid and the pupil appears. */}
            <path
              d="M1.8 11S5 5.4 11 5.4 20.2 11 20.2 11 17 16.6 11 16.6 1.8 11 1.8 11Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={revealed ? undefined : '3 3.2'}
            />
            {revealed && (
              <circle cx="11" cy="11" r="2.7" stroke="currentColor" strokeWidth="1.3" />
            )}
          </svg>
        </button>
      )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs text-graphite-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-xs text-thread">
          {error}
        </p>
      )}
    </div>
  );
});

/**
 * One step of the flow.
 *
 * The transition between identifier and password is the only motion on these
 * screens: a 480ms fade with a small rise, well inside the 400–600ms band and
 * with no spring or bounce — a form that overshoots reads as unserious.
 *
 * It is decoration over an already-rendered step. Nothing waits on it, so a
 * fast typist who hits Enter twice is never blocked, and `motion-reduce`
 * removes it entirely.
 */
export function Step({
  children,
  /** Changing this re-runs the entrance — pass the step name. */
  stepKey,
}: {
  children: ReactNode;
  stepKey: string;
}) {
  return (
    <div key={stepKey} className="auth-step">
      {children}
    </div>
  );
}
