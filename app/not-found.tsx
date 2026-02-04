
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1>
                <p className="text-xl text-slate-600 mb-8">Page not found</p>
                <Link href="/" className="text-blue-600 hover:underline">
                    Go back home
                </Link>
            </div>
        </div>
    );
}
