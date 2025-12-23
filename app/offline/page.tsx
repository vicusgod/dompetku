import Link from 'next/link';

export const metadata = {
    title: 'Offline - dompetku',
};

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
            <div className="bg-white p-4 rounded-3xl shadow-lg shadow-blue-500/10 mb-8">
                <span className="material-symbols-outlined text-6xl text-slate-300">wifi_off</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">You are offline</h1>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                Check your internet connection to access the latest data.
            </p>
            <button
                onClick={() => window.location.reload()}
                className="w-full max-w-xs h-12 bg-primary hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 mb-4"
            >
                Try Again
            </button>
            <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-400 hover:text-primary transition-colors"
            >
                Go to Dashboard (if cached)
            </Link>
        </div>
    );
}
