import { getSpecies } from '../data/dinosaurSpecies.js'
import { COSTS } from '../game/simulation.js'

function fenceColor(health, fenceType) {
  if (health < 15) return '#b91c1c'
  if (health < 30) return '#f97316'
  if (health < 60) return '#eab308'
  return fenceType === 'electric' ? '#0ea5e9' : '#16a34a'
}

export default function ParkMap({ enclosures, dinosaurs, onSelectDinosaur, selectedDinosaurId, onBuildEnclosure, onUpgradeFence, cash }) {
  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <h2>Park Map</h2>
        <button
          className="secondary small"
          disabled={cash < COSTS.ENCLOSURE_BASE_COST}
          onClick={onBuildEnclosure}
          title={`Build a new paddock ($${COSTS.ENCLOSURE_BASE_COST})`}
        >
          + Build Paddock (${COSTS.ENCLOSURE_BASE_COST})
        </button>
      </div>
      <div className="map-grid">
        {enclosures.map((enclosure) => {
          const occupants = enclosure.dinosaurIds
            .map((id) => dinosaurs.find((d) => d.id === id))
            .filter(Boolean)
          const spaceUsed = occupants.reduce((sum, d) => sum + (getSpecies(d.speciesId)?.space || 0), 0)

          return (
            <div
              key={enclosure.id}
              className="enclosure"
              style={{ borderColor: fenceColor(enclosure.fenceHealth, enclosure.fenceType) }}
            >
              <div className="enclosure-header">
                <strong>{enclosure.name}</strong>
                <span className={`fence-tag fence-${enclosure.fenceType}`}>
                  {enclosure.fenceType === 'electric' ? '⚡ Electric' : 'Basic'} Fence
                </span>
              </div>
              <div className="fence-bar-track">
                <div
                  className="fence-bar-fill"
                  style={{
                    width: `${enclosure.fenceHealth}%`,
                    background: fenceColor(enclosure.fenceHealth, enclosure.fenceType),
                  }}
                />
              </div>
              <div className="enclosure-meta">
                Space: {spaceUsed}/{enclosure.capacity}
              </div>
              <div className="enclosure-dinos">
                {occupants.length === 0 && <span className="empty-hint">No dinosaurs yet</span>}
                {occupants.map((dino) => {
                  const species = getSpecies(dino.speciesId)
                  return (
                    <button
                      key={dino.id}
                      className={`dino-token ${dino.id === selectedDinosaurId ? 'selected' : ''} ${dino.sick ? 'sick' : ''}`}
                      onClick={() => onSelectDinosaur(dino.id)}
                      title={dino.name}
                    >
                      <span className="dino-icon">{species?.icon}</span>
                      <span className="dino-mood" data-mood={dino.happiness < 35 ? 'bad' : dino.happiness < 65 ? 'ok' : 'good'} />
                    </button>
                  )
                })}
              </div>
              {enclosure.fenceType === 'basic' && (
                <button
                  className="secondary small"
                  disabled={cash < COSTS.ELECTRIC_UPGRADE_COST}
                  onClick={() => onUpgradeFence(enclosure.id)}
                >
                  Upgrade to Electric (${COSTS.ELECTRIC_UPGRADE_COST})
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
