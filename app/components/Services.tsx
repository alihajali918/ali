export default function Services() {
  const services = ["التصميم الإبداعي", "برمجة Next.js", "إدارة التسويق"];
  return (
    <section className="py-24 px-10 bg-white">
      <h2 className="text-4xl font-black mb-12">خدمات احترافية</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map(s => (
          <div key={s} className="p-10 border border-gray-100 rounded-3xl hover:border-brand-gold transition">
            <h3 className="text-2xl font-bold mb-4">{s}</h3>
            <p className="text-gray-500 text-sm italic underline">اكتشف المزيد</p>
          </div>
        ))}
      </div>
    </section>
  );
}