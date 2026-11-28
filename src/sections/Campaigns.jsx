import FeatureCarousel from '@/components/feature-carousel'
import CampaignRail from '@/components/CampaignRail'
import Highlight from '@/components/Highlight'
import { FEATURED, MORE } from '@/data/campaigns'
import './Campaigns.css'

const SITE = 'https://tasharuky.com'

export default function Campaigns() {
  return (
    <section className="cp" id="projects">
      <header className="cp__head">
        <h2>
          ملفات مفتوحة <Highlight tone="dark">تنتظر من يُكملها</Highlight>
        </h2>
        <p>كل حملة ملف موثّق: صور من الميدان، وما تم جمعه، وما تبقّى للوصول إلى الهدف. افتح الملف، وكن من يُكمله.</p>
      </header>

      <div className="cp__inner">
        <FeatureCarousel items={FEATURED} />
        <CampaignRail items={MORE} title="حملات أخرى تحتاجك" />
      </div>

      <a className="cp__all" href={`${SITE}/ar/projects`}>
        كل الحملات
      </a>
    </section>
  )
}
