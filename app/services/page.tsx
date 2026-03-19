import Navbar from '../components/Navbar';

export default function ServicesPage() {
  const services = [
    { title: "UI/UX Design", icon: "💎" },
    { title: "Next.js Dev", icon: "🚀" },
    { title: "Brand Identity", icon: "🧠" }
  ];

  return (
    <main className="min-h-screen glow-mesh" dir="rtl">
      <Navbar />
      <div className="pt-40 pb-20 px-10 max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-16">خدمات <span className="text-neon-cyan">ذكية</span></h2>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="group p-10 bg-glass backdrop-blur-md border border-glass-border rounded-[2.5rem] hover:scale-105 hover:bg-white/10 transition-all duration-500 cursor-pointer">
              <div className="text-4xl mb-6">{s.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
              <p className="text-gray-400 leading-relaxed">تطوير حلول برمجية فخمة تلائم السوق القطري.</p>
              <div className="mt-8 w-10 h-1 bg-neon-cyan group-hover:w-full transition-all"></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}