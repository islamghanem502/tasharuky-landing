import { MARK_D, MARK_H, MARK_W } from './mark-path'
import './Receipt.css'

/*
 * A thermal receipt, printed by the box. Everything on it is set like a real slip:
 * labels in the body face, figures in a monospace, dotted leaders, a barcode cut
 * from the contribution number, and room at the foot for the rubber stamp.
 */

// a stable barcode for a given number
function bars(seed) {
  let x = seed * 9301 + 49297
  const out = []
  for (let i = 0; i < 34; i++) {
    x = (x * 9301 + 49297) % 233280
    out.push(1 + Math.floor((x / 233280) * 3))
  }
  return out
}

const Row = ({ label, value }) => (
  <div className="rc__row">
    <span>{label}</span>
    <i aria-hidden="true" />
    <span className="rc__mono" dir="ltr">
      {value}
    </span>
  </div>
)

export default function Receipt({ rootRef, stampRef, doneRef, campaign, no, date }) {
  const cells = 18
  const filled = Math.round((campaign.pct / 100) * cells)
  return (
    <div className="rc" ref={rootRef} aria-hidden="true">
      <div className="rc__paper">
        <header className="rc__head">
          <svg viewBox={`0 0 ${MARK_W} ${MARK_H}`} className="rc__mark">
            <path d={MARK_D} fillRule="evenodd" />
          </svg>
          <div>
            <b>تشاركي</b>
            <span>إيصال أثر</span>
          </div>
        </header>

        <hr />
        <Row label="رقم المساهمة" value={`#${String(no).padStart(6, '0')}`} />
        <Row label="التاريخ" value={date} />
        <hr />

        <p className="rc__label">الحملة</p>
        <p className="rc__title">{campaign.name}</p>
        <p className="rc__sub">{campaign.desc}</p>

        <div className="rc__meter">
          <span className="rc__cells">
            {Array.from({ length: cells }, (_, i) => (
              <i key={i} data-on={i < filled || undefined} />
            ))}
          </span>
          <span className="rc__mono" dir="ltr">
            {campaign.pct}%
          </span>
        </div>
        <hr />

        <ol className="rc__track">
          <li data-done>تم الاستلام</li>
          <li data-done>قيد التنفيذ</li>
          <li ref={doneRef}>وصل الأثر</li>
        </ol>
        <hr />

        <div className="rc__barcode">
          {bars(no).map((w, i) => (
            <i key={i} style={{ flexGrow: w, opacity: i % 2 ? 0 : 1 }} />
          ))}
        </div>
        <p className="rc__mono rc__code" dir="ltr">
          TSH-{String(no).padStart(6, '0')}-{campaign.code}
        </p>
        <p className="rc__thanks">شكرًا لأنك جزء من الأثر</p>

        <div className="rc__stamp" ref={stampRef}>
          <b>موثّق</b>
          <span className="rc__mono" dir="ltr">
            {date}
          </span>
        </div>
      </div>
    </div>
  )
}
