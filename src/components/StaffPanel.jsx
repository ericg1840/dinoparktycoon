import { STAFF_TYPES } from '../data/staffTypes.js'

export default function StaffPanel({ staff, cash, onHire, onFire }) {
  const counts = staff.reduce((acc, s) => {
    acc[s.typeId] = (acc[s.typeId] || 0) + 1
    return acc
  }, {})

  return (
    <div className="panel staff-panel">
      <h2>Staff</h2>
      <div className="staff-types">
        {STAFF_TYPES.map((type) => (
          <div key={type.id} className="staff-type-row">
            <div className="staff-type-info">
              <span className="staff-icon">{type.icon}</span>
              <div>
                <div className="staff-label">
                  {type.label} <span className="staff-count">x{counts[type.id] || 0}</span>
                </div>
                <div className="staff-desc">{type.description}</div>
              </div>
            </div>
            <button className="secondary small" disabled={cash < type.salary} onClick={() => onHire(type.id)}>
              Hire (${type.salary}/day)
            </button>
          </div>
        ))}
      </div>

      <h3>Employed</h3>
      {staff.length === 0 && <p className="empty-hint">No staff hired yet.</p>}
      <ul className="staff-list">
        {staff.map((member) => {
          const type = STAFF_TYPES.find((t) => t.id === member.typeId)
          return (
            <li key={member.id}>
              <span>
                {type?.icon} {member.name}
              </span>
              <button className="link-button" onClick={() => onFire(member.id)}>
                Fire
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
