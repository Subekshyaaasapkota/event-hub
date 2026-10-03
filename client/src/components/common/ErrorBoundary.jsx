import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Catches render-time crashes anywhere below it and shows a recoverable screen
 * instead of React unmounting the whole tree to a blank page.
 *
 * Must be a class component: hooks do not run when a render throws.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real deployment this is where the error would be reported to
    // Sentry or similar. Console keeps it visible during development.
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-red-50 text-red-600 mb-8">
            <AlertTriangle size={44} />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-4 text-slate-600 text-lg">
            This screen failed to load. Retrying usually fixes it.
          </p>

          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="mt-8 text-left text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-2xl p-4 overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          ) : null}

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={this.handleReset}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Try again
            </button>

            <a
              href="/"
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
