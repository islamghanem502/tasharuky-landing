import Orbit from '../components/Orbit'
import Highlight from '../components/Highlight'
import './Hero.css'

const SITE = 'https://tasharuky.com'

// each case: the same moment, before and after support reaches it
const CASES = [
  { before: '/hero/boy-before.webp', after: '/hero/boy-after.webp', pos: '50% 38%', label: 'طفل حزين يبتسم من جديد' },
  { before: '/hero/street-before.webp', after: '/hero/street-after.webp', pos: '46% 64%', label: 'أب يدفع عربة يجلس عليها طفله فوق عبوات الماء بين الأنقاض' },
  { before: '/hero/water-before.webp', after: '/hero/water-after.webp', pos: '50% 46%', label: 'طفل يحمل كوبًا من الماء النظيف' },
]

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__text">
        <h1>
          نعزز أثر العطاء الإنساني ونبني <Highlight delay={500}>جسور الثقة</Highlight>
        </h1>
        <p>نعمل على دعم المجتمعات من خلال مبادرات إنسانية وتنموية تسهم في تحسين جودة الحياة وتعزيز الاستقرار المجتمعي.</p>
        <div className="hero__actions">
          <a className="cta" href={`${SITE}/ar/projects`}>اكتشف المشاريع</a>
          <a className="link" href={`${SITE}/orphan/ar`}>اكفل يتيمًا في غزة</a>
        </div>
      </div>
      <div className="hero__orbit">
        <Orbit cases={CASES} />
      </div>
    </section>
  )
}
