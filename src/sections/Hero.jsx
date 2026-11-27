import Compare from '../components/Compare'
import './Hero.css'

const SITE = 'https://tasharuky.com'

// Each case: the same moment, before and after support reaches it.
const CASES = [
  { before: '/hero/street-before.webp', after: '/hero/street-after.webp', label: 'أب يدفع عربة يجلس عليها طفله فوق عبوات الماء، بين أنقاض المباني' },
  { before: '/hero/boy-before.webp', after: '/hero/boy-after.webp', label: 'طفل ينظر إلى الكاميرا، حزينًا ثم مبتسمًا' },
  { before: '/hero/water-before.webp', after: '/hero/water-after.webp', label: 'طفل يحمل كوبًا من الماء النظيف' },
]

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 8H3M7 4 3 8l4 4" />
  </svg>
)

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__grid wrap">
        <div className="hero__text">
          <p className="hero__eyebrow">كل مساهمة منك تصنع أثرًا يمكن تتبعه بوضوح</p>
          <h1 className="hero__title">نعزز أثر العطاء الإنساني ونبني جسور الثقة</h1>
          <p className="hero__lead">
            نعمل على دعم المجتمعات من خلال مبادرات إنسانية وتنموية تسهم في تحسين جودة الحياة وتعزيز الاستقرار المجتمعي.
          </p>
          <div className="hero__actions">
            <a className="btn" href={`${SITE}/ar/projects`}>اكتشف المشاريع <Arrow /></a>
            <a className="btn btn--line" href={`${SITE}/orphan/ar`}>اكفل يتيمًا في غزة</a>
          </div>
          <p className="hero__proof">
            <bdi dir="ltr">+11,664</bdi>
            <span>داعم شاركوا في صناعة الأثر</span>
          </p>
        </div>

        <div className="hero__media">
          <Compare pairs={CASES} caption="حملات موثّقة وأثر يصل لمستحقيه" />
        </div>
      </div>
    </section>
  )
}
