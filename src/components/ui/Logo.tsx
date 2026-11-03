interface LogoProps {
  className?: string
  size?: 'md' | 'lg'
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const iconSize = size === 'lg' ? 'h-16' : 'h-12'
  const textSize = size === 'lg' ? 'text-4xl' : 'text-3xl'

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="40 4 132 160" className={`${iconSize} w-auto`} aria-hidden="true">
        <rect x="46" y="124" width="24" height="36" rx="7" fill="#1F5BFF" fillOpacity="0.55" />
        <rect x="78" y="96" width="24" height="64" rx="7" fill="#1F5BFF" fillOpacity="0.8" />
        <rect x="110" y="68" width="24" height="92" rx="7" fill="#1F5BFF" />
        <rect x="142" y="40" width="24" height="120" rx="7" fill="#22C98A" />
        <circle cx="154" cy="22" r="16" fill="none" stroke="#E5484D" strokeOpacity="0.45" strokeWidth="3" />
        <circle cx="154" cy="22" r="8" fill="#E5484D" />
      </svg>
      <span className={`font-poppins ${textSize} font-bold text-white`}>
        Ventas<span className="text-[#22C98A]">Live</span>
      </span>
    </span>
  )
}