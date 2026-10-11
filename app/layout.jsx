import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Big/Small Prediction & Management System',
  description: 'High performance secure fullstack web application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans">
        <div className="max-w-md mx-auto p-4 pb-20">
          {/* <header className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-4 shadow-lg">
            
            
          </header> */}

          <main>{children}</main>

        </div>
      </body>
    </html>
  );
}