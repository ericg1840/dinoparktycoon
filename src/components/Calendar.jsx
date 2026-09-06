export default function Calendar({ day, quarter, year, onAdvanceDay, onSkipQuarter, gameOver }) {
  return (
    <div className="panel calendar-panel">
      <h2>Calendar</h2>
      <div className="calendar-readout">
        <div>
          <span className="label">Year</span>
          <span className="value">{year}</span>
        </div>
        <div>
          <span className="label">Quarter</span>
          <span className="value">Q{quarter}</span>
        </div>
        <div>
          <span className="label">Day</span>
          <span className="value">{day} / 90</span>
        </div>
      </div>
      <div className="calendar-actions">
        <button disabled={gameOver} onClick={onAdvanceDay}>
          Advance Day
        </button>
        <button disabled={gameOver} className="secondary" onClick={onSkipQuarter}>
          Skip to Next Quarter
        </button>
      </div>
      {gameOver && <p className="game-over-text">The park has closed. Bankruptcy ended the season.</p>}
    </div>
  )
}
