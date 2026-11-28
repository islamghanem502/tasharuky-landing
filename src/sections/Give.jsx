import { useInView } from 'motion/react'
import { useRef } from 'react'
import Bucket from '@/components/bucket'
import Underline from '@/components/Underline'
import './Give.css'

const SITE = 'https://tasharuky.com'

export default function Give() {
  const stage = useRef(null)
  const seen = useInView(stage, { once: true, amount: 0.5 })

  return (
    <section className="give">
      <div className="give__text">
        <h2>
          مساهمتك <Underline>لا تختفي</Underline> في الصندوق
        </h2>
        <p>من لحظة إطلاق المشروع وحتى اكتمال تنفيذه، نتابع مراحل العمل ونشارك المستجدات والنتائج؛ ليبقى الداعم قريبًا من مسار الأثر.</p>
        <a className="cta" href={`${SITE}/ar/projects`}>ابدأ مساهمتك</a>
      </div>

      <div className="give__stage" ref={stage}>
        <div className="give__box">
          <Bucket active={seen} />
        </div>
      </div>
    </section>
  )
}
