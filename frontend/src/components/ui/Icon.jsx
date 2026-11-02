const files = import.meta.glob('../../assets/figma/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
})
const icons = {
  menu: '24252.svg',
  user: '2200c.svg',
  eye: '1a358.svg',
  pin: '08765.svg',
  navigation: 'd8158.svg',
  arrowUpRight: '49c00.svg',
  settings: 'fdec1.svg',
  users: '1b4e5.svg',
  briefcase: 'acd1e.svg',
  arrowRight: 'de4e5.svg',
  shield: 'e9a8b.svg',
  heart: '064a5.svg',
  chevronUp: '5712c.svg',
  calendar: '9c56e.svg',
  check: '4a052.svg',
  stepCheck: '23a66.svg',
  chevronRight: 'af409.svg',
  warning: '627c5.svg',
  error: '4df03.svg',
  loginError: '6230f.svg',
  ticket: '75a8d.svg',
  ticketActive: '406c0.svg',
  heartNav: '2b831.svg',
  bell: '94ee6.svg',
  chevronLeft: 'ea203.svg',
  userSmall: '87ed7.svg',
  car: '82545.svg',
  wallet: 'b975e.svg',
  business: 'faceb.svg',
  location: 'cb689.svg',
  decision: 'c2650.svg',
  info: 'f6da9.svg',
  dot: 'ae7fa.svg',
  dotSuccess: '952fa.svg',
  dotWarning: '8754a.svg',
  statusWarning: '4265e.svg',
  statusSuccess: '9993c.svg',
  userButton: 'a0d2e.svg',
  breadcrumb: '0748a.svg',
}

export default function Icon({ name, size = 20, className = '' }) {
  const src = files[`../../assets/figma/${icons[name]}`]
  if (!src) return null
  return (
    <img
      className={`icon ${className}`}
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
    />
  )
}
