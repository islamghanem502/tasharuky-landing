import { MARK_D, MARK_H, MARK_W } from './mark-path'
import './Receipt.css'

/*
 * A thermal receipt, printed by the box. Set like a real slip, but short and wide:
 * the number and date sit beside the name in the head, the three stages run along one
 * line, and the barcode shares the foot with the thanks — so the slip stays low and
 * the box keeps its place on the page.
 */

// a stable barcode for a given number
function bars(seed) {
  let x = seed * 9301 + 49297
  const out = []
  for (let i = 0; i < 30; i++) {
    x = (x * 9301 + 49297) % 233280
    out.push(1 + Math.floor((x / 233280) * 3))
  }
  return out
}

export default function Receipt({ rootRef, stampRef, doneRef, campaign, no, date }) {
  const cells = 20
  const filled = Math.round((campaign.pct / 100) * cells)
  const num = String(no).padStart(6, '0')
  return (
    <div className="rc" ref={rootRef} aria-hidden="true">
      <div className="rc__paper">
        <header className="rc__head">
          <svg viewBox={`0 0 ${MARK_W} ${MARK_H}`} className="rc__mark">
            <path d={MARK_D} fillRule="evenodd" />
          </svg>
          <div className="rc__brand">
            <b>تشاركي</b>
            <span>إيصال أثر</span>
          </div>
          <div className="rc__meta rc__mono" dir="ltr">
            <span>#{num}</span>
            <span>{date}</span>
          </div>
        </header>

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

        <div className="rc__foot">
          <div className="rc__barcode">
            {bars(no).map((w, i) => (
              <i key={i} style={{ flexGrow: w, opacity: i % 2 ? 0 : 1 }} />
            ))}
          </div>
          <div className="rc__sign">
            <p className="rc__thanks">شكرًا لأنك جزء من الأثر</p>
            <p className="rc__mono rc__code" dir="ltr">
              TSH-{num}-{campaign.code}
            </p>
          </div>
        </div>

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
