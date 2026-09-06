export default function WarningsPanel({ warnings, events, onDismissEvent }) {
  if (warnings.length === 0 && events.length === 0) return null

  return (
    <div className="panel warnings-panel">
      <h2>Warnings</h2>
      {events.length > 0 && (
        <ul className="event-list">
          {events.map((event) => (
            <li key={event.id} className={`event event-${event.type}`}>
              <span>{event.message}</span>
              <button className="link-button" onClick={() => onDismissEvent(event.id)}>
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="warning-list">
          {warnings.map((w) => (
            <li key={w.id} className={`warning warning-${w.severity}`}>
              {w.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
