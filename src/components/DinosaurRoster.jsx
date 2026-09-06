import { useState } from 'react'
import { SPECIES } from '../data/dinosaurSpecies.js'

export default function DinosaurRoster({ enclosures, cash, onBuy, enclosureFreeSpace }) {
  const [speciesId, setSpeciesId] = useState(SPECIES[0].id)
  const [enclosureId, setEnclosureId] = useState(enclosures[0]?.id || '')
  const [name, setName] = useState('')

  const species = SPECIES.find((s) => s.id === speciesId)
  const free = enclosureId ? enclosureFreeSpace(enclosureId) : 0
  const canAfford = species ? cash >= species.cost : false
  const fits = species ? free >= species.space : false

  function handleBuy() {
    if (!species || !enclosureId || !canAfford || !fits) return
    onBuy(speciesId, enclosureId, name.trim())
    setName('')
  }

  return (
    <div className="panel roster-panel">
      <h2>Dinosaur Roster</h2>
      <div className="roster-form">
        <select value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
          {SPECIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name} — ${s.cost}
            </option>
          ))}
        </select>
        <select value={enclosureId} onChange={(e) => setEnclosureId(e.target.value)}>
          {enclosures.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} (free space: {enclosureFreeSpace(e.id)})
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Optional name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleBuy} disabled={!canAfford || !fits}>
          Buy for ${species?.cost}
        </button>
      </div>
      {!canAfford && <p className="hint warn">Not enough cash.</p>}
      {canAfford && !fits && <p className="hint warn">Not enough space in that paddock.</p>}

      <div className="species-grid">
        {SPECIES.map((s) => (
          <div key={s.id} className={`species-card diet-${s.diet.toLowerCase()}`}>
            <div className="species-icon">{s.icon}</div>
            <div className="species-name">{s.name}</div>
            <div className="species-meta">
              {s.diet} · Space {s.space} · ${s.cost}
              {s.dangerous && <span className="danger-badge"> ⚠ Dangerous</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
