import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home, Copy, Check } from "lucide-react";

/**
 * Catches render-time crashes anywhere below it and shows a recoverable screen
 * instead of React unmounting the whole tree to a blank page.
 *
 * Must be a class component: hooks do not run when a render throws.
 *
 * The primary action is a full reload rather than clearing local error state.
 * A crash in render is usually deterministic, so resetting the boundary re-runs
 * the same failing render and throws again in front of the user, which reads as
 * an unresponsive button.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, copied: false };
    this.headingRef = React.createRef();
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real deployment this is where the error would be reported to
    // Sentry or similar. Console keeps it visible during development.
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps, prevState) {
    // Move focus to the heading so a screen reader announces the new screen
    // instead of continuing from wherever the crash left it.
    if (!prevState.hasError && this.state.hasError) {
      this.headingRef.current?.focus();
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleCopy = async () => {
    const { error } = this.state;
    const text = [
      error?.message || "Unknown error",
      error?.stack || "",
      window.location.href,
    ]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copied: true });
    } catch {
      // Clipboard needs a secure context, so a copy button is a convenience
      // and not something worth interrupting the user over.
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error, copied } = this.state;

    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-20">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-700">
            <AlertTriangle size={34} aria-hidden="true" />
          </div>

          <h1
            ref={this.headingRef}
            tabIndex={-1}
            className="font-display text-3xl font-semibold tracking-tight text-ink outline-none md:text-4xl"
          >
            This page ran into an error
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">
            Something went wrong while drawing this screen. That is a bug on our
            side rather than anything you did, and reloading usually clears it.
          </p>

          {import.meta.env.DEV && error?.message ? (
            <div className="mt-8 rounded-2xl border border-hairline bg-white p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Developer detail
                </h2>
                <button
                  type="button"
                  onClick={this.handleCopy}
                  className="press inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-hairline px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-50 hover:text-ink"
                >
                  {copied ? (
                    <Check size={13} aria-hidden="true" />
                  ) : (
                    <Copy size={13} aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-red-700">
                {error.message}
              </pre>
            </div>
          ) : null}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={this.handleReload}
              className="press inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ink px-8 py-4 font-semibold text-paper transition-colors duration-200 hover:bg-stone-800"
            >
              <RotateCcw size={18} aria-hidden="true" />
              Reload the page
            </button>

            <Link
              to="/"
              className="press inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-hairline bg-white px-8 py-4 font-semibold text-ink transition-colors duration-200 hover:bg-stone-50"
            >
              <Home size={18} aria-hidden="true" />
              Back to home
            </Link>
          </div>

          <p className="mt-8 text-sm text-stone-500">
            If it keeps happening, please tell us what you were doing and we will
            look into it.
          </p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
