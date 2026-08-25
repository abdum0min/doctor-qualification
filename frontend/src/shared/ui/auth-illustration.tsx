/**
 * Auth sahifasining o'ng tomonidagi dekorativ rasm.
 * Barcha ranglar CSS o'zgaruvchilaridan olinadi — light/dark rejimga o'zi moslashadi.
 */
export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 320"
      fill="none"
      role="img"
      aria-label="Boshqaruv paneli tasviri"
      className={className}
    >
      <ellipse cx="210" cy="286" rx="168" ry="20" fill="var(--muted)" />
      <circle cx="210" cy="150" r="132" fill="var(--chart-1)" opacity="0.06" />

      <rect
        x="108"
        y="60"
        width="230"
        height="152"
        rx="10"
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <rect x="108" y="60" width="230" height="26" rx="10" fill="var(--muted)" />
      <rect x="108" y="76" width="230" height="10" fill="var(--muted)" />
      <circle cx="122" cy="73" r="3.5" fill="var(--chart-2)" />
      <circle cx="134" cy="73" r="3.5" fill="var(--chart-4)" />
      <circle cx="146" cy="73" r="3.5" fill="var(--chart-3)" />

      <rect x="122" y="100" width="46" height="30" rx="6" fill="var(--chart-1)" opacity="0.16" />
      <rect x="176" y="100" width="46" height="30" rx="6" fill="var(--chart-3)" opacity="0.16" />
      <rect x="230" y="100" width="46" height="30" rx="6" fill="var(--chart-4)" opacity="0.16" />
      <rect x="284" y="100" width="40" height="30" rx="6" fill="var(--chart-5)" opacity="0.16" />

      <g strokeLinecap="round">
        <path d="M122 190h202" stroke="var(--border)" strokeWidth="2" />
        <path
          d="M126 178l30-14 26 10 28-26 30 12 28-22 30 14"
          stroke="var(--chart-1)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="298" cy="142" r="4" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" />

      <path d="M198 212h52l8 34h-68z" fill="var(--muted)" />
      <rect x="180" y="246" width="88" height="8" rx="4" fill="var(--border)" />

      <g>
        <rect
          x="26"
          y="126"
          width="86"
          height="60"
          rx="8"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle
          cx="56"
          cy="156"
          r="17"
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="7"
          strokeDasharray="80 27"
          strokeLinecap="round"
          transform="rotate(-90 56 156)"
        />
        <rect x="82" y="145" width="20" height="5" rx="2.5" fill="var(--border)" />
        <rect x="82" y="157" width="14" height="5" rx="2.5" fill="var(--border)" />
      </g>

      <g>
        <rect
          x="312"
          y="196"
          width="82"
          height="56"
          rx="8"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <rect x="324" y="232" width="12" height="10" rx="3" fill="var(--chart-3)" />
        <rect x="342" y="222" width="12" height="20" rx="3" fill="var(--chart-3)" />
        <rect x="360" y="212" width="12" height="30" rx="3" fill="var(--chart-3)" />
        <rect x="324" y="208" width="26" height="5" rx="2.5" fill="var(--border)" />
      </g>

      <g>
        <path d="M64 286V236" stroke="var(--chart-3)" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M64 250c-16-2-24-14-22-30 16-2 26 10 22 30z"
          fill="var(--chart-3)"
          opacity="0.55"
        />
        <path
          d="M64 262c16-3 24-16 21-33-16 0-26 12-21 33z"
          fill="var(--chart-3)"
          opacity="0.8"
        />
        <path d="M48 286h32l-4 20H52z" fill="var(--chart-2)" opacity="0.75" />
      </g>
    </svg>
  )
}
