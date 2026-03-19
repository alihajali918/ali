export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center glow-mesh px-6">
      <div className="text-center z-10">
        <span className="text-neon-purple font-bold tracking-[0.5em] mb-4 block animate-pulse">DIGITAL ARCHITECT</span>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
          نصمم <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">المستقبل</span> الرقمي
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          نجمع بين ذكاء البرمجة وفخامة التصميم لنبني تجارب تتجاوز التوقعات.
        </p>
        <div className="flex gap-6 justify-center">
          <button className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition">إبدأ مشروعك</button>
          <button className="border border-glass-border bg-glass px-10 py-4 rounded-2xl font-bold text-lg backdrop-blur-md">تصفح الأعمال</button>
        </div>
      </div>
      
      {/* Floating Cards (Glass Depth) */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-glass backdrop-blur-lg border border-glass-border rounded-3xl rotate-12 animate-bounce hidden lg:block"></div>
      <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-glass backdrop-blur-lg border border-glass-border rounded-[3rem] -rotate-12 animate-pulse hidden lg:block"></div>
    </section>
  );
}