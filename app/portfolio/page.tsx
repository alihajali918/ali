import Navbar from '../components/Navbar';

export default function PortfolioPage() {
  const projects = ["البلدي القابضة", "فيليرو مول", "تارجت"];
  
  return (
    <main className="min-h-screen bg-dark-bg" dir="rtl">
      <Navbar />
      <div className="pt-40 px-10 max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-20 text-center">مشاريع <span className="text-neon-purple">استثنائية</span></h2>
        <div className="grid md:grid-cols-2 gap-16">
          {projects.map((p, i) => (
            <div key={i} className="relative group h-[500px] rounded-[3rem] overflow-hidden border border-glass-border">
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10"></div>
              {/* هنا خلفية المشروع */}
              <div className="absolute bottom-10 right-10 z-20 transition-transform group-hover:-translate-y-4 duration-500">
                <h3 className="text-4xl font-black mb-2">{p}</h3>
                <span className="text-neon-cyan font-bold tracking-widest uppercase text-xs">Case Study</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}