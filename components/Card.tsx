const DOT_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
] as const

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
              backgroundColor: card[color] ? `var(--${color})` : undefined,
            }}
          />
        ))}
      </div>
      <div className="Card-back" />
    </div>
  )
}
export default Card
