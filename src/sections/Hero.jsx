import Orbit from '../components/Orbit'
import Highlight from '../components/Highlight'
import './Hero.css'

const SITE = 'https://tasharuky.com'

// field photographs from Tasharuky's own campaigns
const CASES = [
  { src: '/field/hat.webp', label: 'طفلتان تبتسمان في مخيم للنازحين' },
  { src: '/field/water.webp', label: 'طفل يحمل لافتة مشروع سقيا الماء' },
  { src: '/field/girls.webp', label: 'أطفال يلوّحون بفرح بعد توزيع المساعدات' },
  { src: '/field/quran.webp', label: 'طفل في حلقة تحفيظ القرآن' },
  { src: '/field/aid.webp', label: 'متطوعون يوزّعون المساعدات' },
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
