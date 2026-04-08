import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Code2, Palette, Fingerprint, BarChart3, Award, ShoppingCart } from "lucide-react";

const services = [
  {
    icon: <Code2 size={32} />,
    title: "برمجة Next.js",
    desc: "تطوير مواقع وتطبيقات ويب عالية الأداء باستخدام Next.js 15 وReact 19. تحسين SEO، سرعة تحميل فائقة، وأكواد نظيفة قابلة للصيانة.",
    features: ["App Router", "Server Components", "API Routes", "SEO متقدم"],
    price: "يبدأ من 2,000 ريال",
    color: "cyan",
    icon_color: "#00F5D4",
  },
  {
    icon: <Palette size={32} />,
    title: "تصميم UI/UX",
    desc: "تصميم واجهات مستخدم فاخرة تعكس هوية علامتك التجارية وتُحوّل الزوار إلى عملاء. تجربة مستخدم مدروسة على كل الأجهزة.",
    features: ["Figma Design", "Design System", "Responsive UI", "Micro-interactions"],
    price: "يبدأ من 1,500 ريال",
    color: "purple",
    icon_color: "#7B61FF",
  },
  {
    icon: <Fingerprint size={32} />,
    title: "هوية بصرية",
    desc: "بناء هوية بصرية متكاملة من شعار وألوان وخطوط وعناصر تصميم متناسقة تترك انطباعاً لا يُنسى.",
    features: ["Logo Design", "Brand Colors", "Typography", "Brand Guide"],
    price: "يبدأ من 800 ريال",
    color: "cyan",
    icon_color: "#00F5D4",
  },
  {
    icon: <BarChart3 size={32} />,
    title: "لوحات التحكم",
    desc: "تطوير لوحات تحكم احترافية وأنظمة إدارة مخصصة مع تحليلات متقدمة وتقارير تفاعلية في الوقت الفعلي.",
    features: ["Real-time Data", "Custom Reports", "Role Management", "Charts & Graphs"],
    price: "يبدأ من 4,000 ريال",
    color: "purple",
    icon_color: "#7B61FF",
  },
  {
    icon: <ShoppingCart size={32} />,
    title: "متاجر إلكترونية",
    desc: "بناء متاجر إلكترونية متكاملة مع بوابات دفع خليجية، إدارة المخزون، وتجربة شراء سلسة وآمنة.",
    features: ["Payment Gateway", "Inventory Mgmt", "Order Tracking", "Arabic Support"],
    price: "يبدأ من 3,500 ريال",
    color: "cyan",
    icon_color: "#00F5D4",
  },
  {
    icon: <Award size={32} />,
    title: "صانع الشهادات",
    desc: "منصة SaaS لمراكز التدريب لإنشاء شهادات احترافية مخصصة بالذكاء الاصطناعي مع إمكانية تخصيص كامل للألوان والعناصر.",
    features: ["AI Generation", "Custom Branding", "PDF Export", "Bulk Issuance"],
    price: "اشتراك شهري: 200 ريال",
    color: "purple",
    icon_color: "#7B61FF",
    badge: "قريباً",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-20">
          <span className="section-badge mb-6 inline-flex">SERVICES</span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            خدمات <span className="text-gradient">احترافية</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            من الفكرة حتى الإطلاق — نقدم حلولاً برمجية وتصميمية متكاملة تناسب احتياجاتك وميزانيتك
          </p>
        </div>

        {/* الكروت */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div
              key={i}
              className="glass-card-hover relative rounded-3xl p-8 flex flex-col group"
            >
              {/* شارة */}
              {s.badge && (
                <span className="absolute top-5 left-5 px-2.5 py-1 text-[10px] font-black bg-neon-purple/15 text-neon-purple border border-neon-purple/20 rounded-full tracking-widest uppercase">
                  {s.badge}
                </span>
              )}

              {/* أيقونة */}
              <div
                className="w-16 h-16 flex items-center justify-center rounded-2xl mb-6 transition-all duration-300 group-hover:scale-110"
                style={{
                  color: s.icon_color,
                  background: `${s.icon_color}12`,
                }}
              >
                {s.icon}
              </div>

              {/* عنوان */}
              <h2 className="text-xl font-black mb-3 text-white">{s.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{s.desc}</p>

              {/* مميزات */}
              <ul className="flex flex-col gap-2 mb-8">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: s.icon_color }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* السعر */}
              <div
                className="pt-6 border-t flex items-center justify-between"
                style={{ borderColor: `${s.icon_color}15` }}
              >
                <span className="text-sm font-bold" style={{ color: s.icon_color }}>
                  {s.price}
                </span>
                <a
                  href="/contact"
                  className="px-4 py-2 text-xs font-black rounded-xl transition-all duration-300"
                  style={{
                    background: `${s.icon_color}15`,
                    color: s.icon_color,
                    border: `1px solid ${s.icon_color}25`,
                  }}
                >
                  اطلب الآن
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
