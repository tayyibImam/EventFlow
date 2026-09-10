// BuildingIcon — Custom SVG icon component for venue/building locations.
// Accepts a `size` prop (defaults to 24) and passes through any additional SVG props.
export default function BuildingIcon(props) {
  const { size = 24, ...svgProps } = props

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...svgProps}>
      {/* Building outline: roof, walls, windows */}
      <path d="M3 21h18M5 21V5l7-3 7 3v16M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M16 12h.01" />
    </svg>
  )
}
