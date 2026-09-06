import { getSpecies } from '../data/dinosaurSpecies.js'

export default function DinoFactPanel({ dinosaur, enclosure, onClose }) {
  if (!dinosaur) {
    return (
      <div className="panel fact-panel">
        <h2>Dinosaur Info</h2>
        <p className="empty-hint">Click a dinosaur on the map to see its details.</p>
      </div>
    )
  }

  const species = getSpecies(dinosaur.speciesId)

  return (
    <div className="panel fact-panel">
      <div className="panel-header">
        <h2>
          {species?.icon} {dinosaur.name}
        </h2>
        <button className="link-button" onClick={onClose}>
          Close
        </button>
      </div>
      <p className="species-title">{species?.name}</p>
      <p>{species?.fact}</p>
      <div className="dino-stats">
        <div>
          <span className="label">Diet</span>
          <span className="value">{species?.diet}</span>
        </div>
        <div>
          <span className="label">Space Needed</span>
          <span className="value">{species?.space}</span>
        </div>
        <div>
          <span className="label">Enclosure</span>
          <span className="value">{enclosure?.name || 'Unassigned'}</span>
        </div>
        <div>
          <span className="label">Happiness</span>
          <span className="value">{Math.round(dinosaur.happiness)}%</span>
        </div>
        <div>
          <span className="label">Health</span>
          <span className="value">{Math.round(dinosaur.health)}%</span>
        </div>
        <div>
          <span className="label">Status</span>
          <span className={`value ${dinosaur.sick ? 'negative' : ''}`}>{dinosaur.sick ? 'Sick' : 'Healthy'}</span>
        </div>
      </div>
    </div>
  )
}
