import Navbar from './components/Navbar';
import Hero from './components/Hero';

export default function Home() {
  return (
    <main dir="rtl" className="scroll-smooth">
      <Navbar />
      <Hero />
      
      {/* قسم الدفع "فوراً" مع تأثير Glow نيون */}
      <footer className="py-32 px-10 text-center">
        <div className="max-w-4xl mx-auto p-1 border border-neon-cyan/20 rounded-[4rem] bg-glass backdrop-blur-xl shadow-[0_0_50px_rgba(0,245,212,0.1)]">
          <div className="p-20">
            <h2 className="text-4xl font-black mb-8">هل أنت مستعد للمستقبل؟</h2>
            <div className="inline-block px-10 py-5 bg-dark-bg border border-neon-cyan rounded-2xl mb-10">
               <span className="text-neon-cyan font-black text-3xl tracking-tighter">فـوراً | FAWRAN</span>
            </div>
            <br/>
            <button className="text-white border-b-2 border-neon-purple pb-2 font-bold text-xl hover:text-neon-purple transition">
               تواصل معنا الآن لتنفيذ فكرتك
            </button>
          </div>
        </div>
        <p className="mt-20 text-gray-600 text-sm font-bold tracking-[1em]">ALI HAJALI | QATAR 2026</p>
      </footer>
    </main>
  );
}