import Bucket from '@/components/bucket'
import './Give.css'

export default function Give() {
  return (
    <section className="give">
      <h2>كل مساهمة منك تصنع أثرًا يمكن تتبعه بوضوح</h2>
      <div className="give__stage">
        <Bucket />
      </div>
    </section>
  )
}
