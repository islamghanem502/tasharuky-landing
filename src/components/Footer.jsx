import Highlight from './Highlight'
import './Footer.css'

const SITE = 'https://tasharuky.com'
const EMAIL = 'info@tasharuky.com'
const YEAR = new Date().getFullYear()

const COLUMNS = [
  {
    title: 'تشاركي',
    links: [
      ['عن تشاركي', '/ar/about'],
      ['الهيئة الاستشارية', '/ar/advisors'],
      ['الكيانات القانونية', '/ar/page/page-8/8'],
      ['القطاعات', '/ar/sectors'],
      ['تواصل معنا', '/ar/contact'],
    ],
  },
  {
    title: 'آلية العمل',
    links: [
      ['كيف تعمل تشاركي؟', '/ar/use-guide'],
      ['سياسة استرداد الأموال', '/ar/page/refund_policy/4'],
      ['سياسة الخصوصية', '/ar/privacy'],
      ['شروط الاستخدام والأحكام', '/ar/acceptable-use'],
      ['سياسة مكافحة غسل الأموال', '/ar/page/page-7/7'],
    ],
  },
  {
    title: 'ابدأ الآن',
    links: [
      ['تصفح الحملات', '/ar/projects'],
      ['اكفل يتيمًا في غزة', '/orphan/ar'],
      ['تواصل للشراكات', '/ar/contact'],
      ['إنشاء حساب', '/sign-up'],
      ['دخول', '/sign-in'],
    ],
  },
]

const SOCIAL = [
  {
    name: 'فيسبوك',
    href: 'https://www.facebook.com/tasharuky',
    icon: <path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.6c-.4-.1-1.6-.2-2.9-.2-2.8 0-4.6 1.7-4.6 4.8v1.3H6.6v3.3h2.9V22H14V11.8h2.8l.4-3.3H14Z" fill="currentColor" stroke="none" />,
  },
  {
    name: 'إنستغرام',
    href: 'https://www.instagram.com/tasharuky_platform',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    name: 'يوتيوب',
    href: 'https://www.youtube.com/@Tasharuky',
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4.5" />
        <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
]

// the two registered non-profits that Tasharuky works through (tasharuky.com/ar/page/page-8/8)
const ENTITIES = [
  {
    code: 'US',
    name: 'TASHARUKY GLOBAL FOUNDATION INC.',
    where: 'ولاية وايومنغ، الولايات المتحدة الأمريكية',
    form: ['شركة غير ربحية', 'Public Benefit Nonprofit Corporation'],
  },
  {
    code: 'UK',
    name: 'TASHARUKY GLOBAL FOUNDATION LTD',
    where: 'إنجلترا وويلز، المملكة المتحدة',
    form: ['شركة غير ربحية مسجلة لدى سجل الشركات البريطاني', 'Companies House'],
  },
]

// the same barcode the receipts carry, cut from the year
function bars(seed) {
  let x = seed * 9301 + 49297
  return Array.from({ length: 26 }, () => {
    x = (x * 9301 + 49297) % 233280
    return 1 + Math.floor((x / 233280) * 3)
  })
}

/*
 * The page ends the way the slip from the box ends: torn from the roll, and a thank-you.
 * Under it, everything a supporter may look for — the pages, the policies, the two
 * registered entities behind the platform, and how to reach the team.
 */
export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft__inner">
        <div className="ft__close">
          <h2>
            شكرًا لأنك جزء من <Highlight tone="dark">الأثر</Highlight>
          </h2>
          <div className="ft__reach">
            <a className="ft__cta" href={`${SITE}/ar/projects`}>
              تبرع الآن
            </a>
            <a className="ft__mail" href={`mailto:${EMAIL}`}>
              <span>راسلنا على</span>
              <b dir="ltr">{EMAIL}</b>
            </a>
          </div>
        </div>

        <div className="ft__grid">
          <div className="ft__brand">
            <a className="ft__logo" href="/" aria-label="تشاركي — الرئيسية">
              <span />
            </a>
            <p>منصة رقمية للعمل الإنساني، توظّف التقنية والشراكات لتحويل العطاء والتكافل إلى مشاريع إنسانية فاعلة وموثوقة.</p>
            <p className="ft__follow">تابع أحدث الحملات وقصص الأثر وتحديثات المنصة</p>
            <ul className="ft__social">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noreferrer" aria-label={s.name}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <nav className="ft__col" key={col.title} aria-label={col.title}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={`${SITE}${href}`}>{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="ft__legal">
          <h3>الكيانات القانونية</h3>
          <div className="ft__entities">
            {ENTITIES.map((e) => (
              <div className="ft__entity" key={e.code}>
                <span className="ft__code" dir="ltr">
                  {e.code}
                </span>
                <div>
                  <b dir="ltr">{e.name}</b>
                  <p>{e.where}</p>
                  <p>
                    {e.form[0]} <span dir="ltr">({e.form[1]})</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="ft__note">
            يحتفظ كل كيان بشخصيته القانونية المستقلة، ويتم الإفصاح عن الكيان المستلم للمساهمة قبل إتمام عملية الدفع.
          </p>
        </div>

        <div className="ft__bar">
          <p>© {YEAR} تشاركي. جميع الحقوق محفوظة.</p>
          <div className="ft__sign" aria-hidden="true">
            <span className="ft__bars">
              {bars(YEAR).map((w, i) => (
                <i key={i} style={{ flexGrow: w, opacity: i % 2 ? 0 : 1 }} />
              ))}
            </span>
            <span dir="ltr">TSH-{YEAR}</span>
          </div>
          <div className="ft__end">
            <a href={`${SITE}/en`} lang="en">
              English
            </a>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              إلى الأعلى
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 13V3M4 7l4-4 4 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
