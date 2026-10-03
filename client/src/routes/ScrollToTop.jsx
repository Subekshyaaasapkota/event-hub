import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sends the window back to the top when the route changes.
 *
 * React Router does not touch scroll position, so without this every navigation
 * lands the next page wherever the last one happened to be scrolled to. Reading
 * three quarters into About and clicking a link meant arriving halfway down
 * Contact, which reads as a broken page rather than a new one.
 *
 * This used to be handled per page with window.scrollTo(0, 0) inside an effect.
 * That only ever worked for the pages someone remembered to add it to, which is
 * why it was missing on most of them. One place in the router is the right home
 * for it.
 *
 * Two details that matter:
 *
 * Hash targets are left alone, so /faq#refunds still lands on the anchor rather
 * than being yanked to the top and made unreachable.
 *
 * Only the pathname and search are in the dependency array. A change to the
 * location object that does not change either of those is a no-op, so filter and
 * sort changes that rewrite the query string will still reset scroll, which is
 * what you want, while a re-render of the same route will not fight the user.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
