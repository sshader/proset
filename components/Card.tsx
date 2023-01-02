const Card = ({
  card,
  selectionColor = null,
  size = 'regular',
}: {
  card: {
    red: boolean
    orange: boolean
    yellow: boolean
    green: boolean
    blue: boolean
    purple: boolean
  }
  selectionColor?: string | null
  size: 'regular' | 'mini'
}) => {
  const dropShadowClass = selectionColor ? `Dropshadow--${selectionColor}` : ''
  return (
    <div className={`Card Card--${size} ${dropShadowClass}`}>
      <div className="Card-row">
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.red ? 'red' : 'inherit',
            }}
          ></div>
        </div>
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.orange ? 'orange' : 'inherit',
            }}
          ></div>
        </div>
      </div>
      <div className="Card-row">
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.yellow ? '#f5e653' : 'inherit',
            }}
          ></div>
        </div>
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.green ? 'green' : 'inherit',
            }}
          ></div>
        </div>
      </div>
      <div className="Card-row">
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.blue ? 'blue' : 'inherit',
            }}
          ></div>
        </div>
        <div className="Card-dotContainer">
          <div
            className="Card-dot"
            style={{
              backgroundColor: card.purple ? 'purple' : 'inherit',
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}
export default Card
