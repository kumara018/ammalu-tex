/**
 * Is this pathname one of the sign-in screens?
 *
 * THE BUG THIS EXISTS TO KILL. Five components independently wrote
 * `pathname.startsWith('/auth')` to decide whether to hide the rail, the
 * footer and the sound toggle on the sign-in screens. That string is a prefix,
 * not a path segment — and this shop has a route called **`/authentic`**,
 * which starts with `/auth`.
 *
 * So the guarantee page has been shipping with no header and no footer: no
 * way to the shelf, no way to the bag, no policy links, no address, and no way
 * back except the browser's own back button. On the page whose entire job is
 * to make a first-time buyer trust the shop.
 *
 * It was invisible in review because every check agreed with every other
 * check — five call sites, one wrong idea, perfectly consistent. The sister
 * shop has the same route and had the same bug.
 *
 * A path segment ends at a slash or at the end of the string, so that is what
 * this tests. `/auth` and `/auth/login` match; `/authentic` does not.
 */
export function isAuthRoute(pathname: string): boolean {
  return pathname === '/auth' || pathname.startsWith('/auth/');
}
