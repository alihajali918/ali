import Footer from "../components/Footer";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "أساسي",
    name_en: "Starter",
    price: "1,500",
    period: "مرة واحدة",
    desc: "مثالي للشركات الناشئة التي تريد حضوراً رقمياً احترافياً.",
    color: "#00F5D4",
    features: [
      "موقع ويب حتى 5 صفحات",
      "تصميم UI احترافي",
      "تصميم متجاوب (موبايل + ديسكتوب)",
      "SEO أساسي",
      "نموذج تواصل",
      "تسليم خلال 10 أيام",
      "دعم شهر واحد",
    ],
    notIncluded: ["لوحة تحكم", "قاعدة بيانات", "نظام دفع"],
  },
  {
    name: "متقدم",
    name_en: "Professional",
    price: "4,500",
    period: "مرة واحدة",
    desc: "للشركات التي تريد موقعاً كاملاً مع نظام إدارة متطور.",
    color: "#7B61FF",
    popular: true,
    features: [
      "موقع ويب حتى 15 صفحة",
      "تصميم UI/UX متكامل",
      "تصميم متجاوب كامل",
      "SEO متقدم",
      "لوحة تحكم مخصصة",
      "قاعدة بيانات",
      "نظام مصادقة",
      "تسليم خلال 21 يوم",
      "دعم 3 أشهر",
    ],
    notIncluded: ["نظام دفع", "تطبيق جوال"],
  },
  {
    name: "مؤسسي",
    name_en: "Enterprise",
    price: "تواصل",
    period: "تسعير مخصص",
    desc: "حل متكامل للمؤسسات الكبيرة مع دعم مستمر وتطوير مستمر.",
    color: "#F59E0B",
    features: [
      "صفحات غير محدودة",
      "تصميم كامل مخصص",
      "تطبيق ويب متكامل",
      "لوحة تحكم متقدمة",
      "قاعدة بيانات مخصصة",
      "نظام دفع",
      "API خاص",
      "تسليم حسب المتطلبات",
      "دعم سنة كاملة",
      "صيانة شهرية",
    ],
    notIncluded: [],
  },
];

const subscriptions = [
  {
    name: "صيانة شهرية",
    price: "500",
    desc: "تحديثات أمنية، نسخ احتياطية، ومراقبة الأداء لموقعك الحالي.",
    color: "#00F5D4",
    features: [
      "تحديثات أمنية",
      "نسخ احتياطية يومية",
      "مراقبة الأداء",
      "تقرير شهري",
      "إصلاح الأخطاء",
    ],
  },
  {
    name: "صانع الشهادات",
    price: "200",
    desc: "منصة SaaS لمراكز التدريب لإصدار شهادات احترافية بالذكاء الاصطناعي.",
    color: "#7B61FF",
    badge: "قريباً",
    features: [
      "توليد بالذكاء الاصطناعي",
      "تخصيص كامل للألوان",
      "إصدار لا محدود",
      "تصدير PDF",
      "دعم فني",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">

      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-20">
          <span className="section-badge mb-6 inline-flex">PRICING</span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            أسعار <span className="text-gradient">شفافة</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            لا مفاجآت، لا تكاليف مخفية. اختر الباقة التي تناسب مشروعك.
          </p>
        </div>

        {/* باقات المشاريع */}
        <div className="mb-6">
          <p className="text-xs font-black tracking-widest text-gray-600 uppercase mb-8 text-center">
            مشاريع — دفعة واحدة
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "border border-neon-purple/30 bg-neon-purple/5"
                    : "glass-card-hover"
                }`}
              >
                {/* شارة الأكثر طلباً */}
                {plan.popular && (
                  <div className="absolute -top-4 right-1/2 translate-x-1/2 px-4 py-1.5 bg-neon-purple text-dark-bg text-xs font-black rounded-full tracking-wider flex items-center gap-1">
                    <Zap size={11} fill="currentColor" />
                    الأكثر طلباً
                  </div>
                )}

                {/* رأس الباقة */}
                <div className="mb-8">
                  <p
                    className="text-xs font-black tracking-widest uppercase mb-2"
                    style={{ color: plan.color }}
                  >
                    {plan.name_en}
                  </p>
                  <h2 className="text-2xl font-black text-white mb-2">{plan.name}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">{plan.desc}</p>
                </div>

                {/* السعر */}
                <div className="mb-8 pb-8 border-b border-glass-border">
                  <div className="flex items-baseline gap-2">
                    {plan.price === "تواصل" ? (
                      <span className="text-4xl font-black text-white">تواصل</span>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-white">{plan.price}</span>
                        <span className="text-gray-600 text-sm font-semibold">ريال</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 text-xs mt-1">{plan.period}</p>
                </div>

                {/* المميزات */}
                <ul className="flex flex-col gap-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                      <Check
                        size={15}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: plan.color }}
                      />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-600 line-through">
                      <Check size={15} className="flex-shrink-0 mt-0.5 opacity-30" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* زر */}
                <a
                  href="/contact"
                  className="w-full text-center py-4 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                  style={
                    plan.popular
                      ? {
                          background: plan.color,
                          color: "#0A0A0A",
                        }
                      : {
                          background: `${plan.color}12`,
                          color: plan.color,
                          border: `1px solid ${plan.color}25`,
                        }
                  }
                >
                  {plan.price === "تواصل" ? "تواصل للتسعير" : "ابدأ الآن"}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* خط فاصل */}
        <div className="my-20 flex items-center gap-6">
          <div className="flex-1 h-px bg-glass-border" />
          <p className="text-xs font-black tracking-widest text-gray-600 uppercase">اشتراكات شهرية</p>
          <div className="flex-1 h-px bg-glass-border" />
        </div>

        {/* باقات الاشتراك */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {subscriptions.map((sub, i) => (
            <div key={i} className="glass-card-hover relative rounded-3xl p-8">
              {sub.badge && (
                <span className="absolute top-5 left-5 px-2.5 py-1 text-[10px] font-black bg-neon-purple/15 text-neon-purple border border-neon-purple/20 rounded-full tracking-widest uppercase">
                  {sub.badge}
                </span>
              )}
              <h3 className="text-xl font-black text-white mb-2">{sub.name}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">{sub.desc}</p>

              <div className="mb-6">
                <span className="text-3xl font-black text-white">{sub.price}</span>
                <span className="text-gray-600 text-sm font-semibold mr-1">ريال / شهر</span>
              </div>

              <ul className="flex flex-col gap-3 mb-8">
                {sub.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check size={14} className="flex-shrink-0" style={{ color: sub.color }} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/contact"
                className="w-full block text-center py-3.5 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: `${sub.color}12`,
                  color: sub.color,
                  border: `1px solid ${sub.color}25`,
                }}
              >
                اشترك الآن
              </a>
            </div>
          ))}
        </div>

        {/* ملاحظة */}
        <p className="text-center text-gray-600 text-sm mt-12">
          جميع الأسعار بالريال القطري. يمكن تخصيص الباقات حسب احتياجاتك.{" "}
          <a href="/contact" className="text-neon-cyan hover:underline">
            تواصل للاستفسار
          </a>
        </p>
      </div>

      <Footer />
    </main>
  );
}
