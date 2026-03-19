import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 px-10 py-5">
      <div className="max-w-7xl mx-auto bg-glass backdrop-blur-xl border border-glass-border rounded-2xl px-8 py-4 flex justify-between items-center">
        
        {/* اللوجو مع رابط للرئيسية */}
        <Link href="/" className="text-xl font-black tracking-tighter text-neon-cyan uppercase">
          Ali Hajali
        </Link>

        {/* الروابط باستخدام Link بدلاً من a */}
        <div className="hidden md:flex gap-8 font-medium text-sm text-gray-300">
          <Link href="/" className="hover:text-neon-cyan transition-colors duration-300">
            الرئيسية
          </Link>
          <Link href="/services" className="hover:text-neon-cyan transition-colors duration-300">
            الخدمات
          </Link>
          <Link href="/portfolio" className="hover:text-neon-cyan transition-colors duration-300">
            الأعمال
          </Link>
        </div>

        {/* زر الدفع الفوري */}
        <button className="bg-neon-cyan text-dark-bg px-6 py-2 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(0,245,212,0.3)] hover:scale-105 active:scale-95 transition-all">
          دفع فوري
        </button>
      </div>
    </nav>
  );
}