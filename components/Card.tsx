const DOT_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
] as const

// The classic card palette (separate from the player highlight colors)
const DOT_FILLS: Record<(typeof DOT_COLORS)[number], string> = {
  red: 'red',
  orange: 'orange',
  yellow: '#f5e653',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
}

const Card = ({
  card,
  selectionColor = null,
  size = 'regular',
}: {
  card: Record<(typeof DOT_COLORS)[number], boolean>
  selectionColor?: string | null
  size: 'regular' | 'mini'
}) => {
  const selectionClass = selectionColor
    ? `is-selected player-${selectionColor}`
    : ''
  return (
    <div
      className={`Card Card--${size}`}
      style={{ animation: 'item-enter 1s' }}
    >
      <div className={`Card-front ${selectionClass}`}>
        {DOT_COLORS.map((color) => (
          <div
            key={color}
            className="Card-dot"
            style={{
              backgroundColor: card[color] ? DOT_FILLS[color] : undefined,
            }}
          />
        ))}
      </div>
      <div className="Card-back" />
    </div>
  )
}
export default Card
