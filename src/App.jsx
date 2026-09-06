import { useState } from 'react'
import Calendar from './components/Calendar.jsx'
import ParkMap from './components/ParkMap.jsx'
import DinosaurRoster from './components/DinosaurRoster.jsx'
import StaffPanel from './components/StaffPanel.jsx'
import FinancePanel from './components/FinancePanel.jsx'
import DinoFactPanel from './components/DinoFactPanel.jsx'
import WarningsPanel from './components/WarningsPanel.jsx'
import {
  createInitialState,
  advanceDay,
  advanceToNextQuarter,
  buyDinosaur,
  buildEnclosure,
  upgradeFence,
  hireStaff,
  fireStaff,
  setTicketPrice,
  payLoan,
  dismissEvent,
  enclosureFreeSpace,
} from './game/simulation.js'
import './App.css'

export default function App() {
  const [state, setState] = useState(createInitialState)
  const [selectedDinosaurId, setSelectedDinosaurId] = useState(null)

  const selectedDinosaur = state.dinosaurs.find((d) => d.id === selectedDinosaurId) || null
  const selectedEnclosure = selectedDinosaur
    ? state.enclosures.find((e) => e.id === selectedDinosaur.enclosureId)
    : null

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🦕 Dino Park Tycoon</h1>
        <p className="tagline">Year {state.year} · Quarter {state.quarter} · Day {state.day}</p>
      </header>

      <div className="layout">
        <div className="column column-main">
          <ParkMap
            enclosures={state.enclosures}
            dinosaurs={state.dinosaurs}
            selectedDinosaurId={selectedDinosaurId}
            onSelectDinosaur={setSelectedDinosaurId}
            onBuildEnclosure={() => setState((s) => buildEnclosure(s))}
            onUpgradeFence={(id) => setState((s) => upgradeFence(s, id))}
            cash={state.cash}
          />
          <DinosaurRoster
            enclosures={state.enclosures}
            cash={state.cash}
            onBuy={(speciesId, enclosureId, name) => setState((s) => buyDinosaur(s, speciesId, enclosureId, name))}
            enclosureFreeSpace={(id) => enclosureFreeSpace(state, id)}
          />
        </div>

        <div className="column column-side">
          <Calendar
            day={state.day}
            quarter={state.quarter}
            year={state.year}
            gameOver={state.gameOver}
            onAdvanceDay={() => setState((s) => advanceDay(s))}
            onSkipQuarter={() => setState((s) => advanceToNextQuarter(s))}
          />
          <FinancePanel
            cash={state.cash}
            loan={state.loan}
            reputation={state.reputation}
            cleanliness={state.cleanliness}
            ticketPrice={state.ticketPrice}
            lastVisitors={state.lastVisitors}
            lastRevenue={state.lastRevenue}
            onSetTicketPrice={(price) => setState((s) => setTicketPrice(s, price))}
            onPayLoan={(amount) => setState((s) => payLoan(s, amount))}
            lastQuarterReport={state.lastQuarterReport}
          />
          <WarningsPanel
            warnings={state.warnings}
            events={state.events}
            onDismissEvent={(id) => setState((s) => dismissEvent(s, id))}
          />
          <StaffPanel
            staff={state.staff}
            cash={state.cash}
            onHire={(typeId) => setState((s) => hireStaff(s, typeId))}
            onFire={(staffId) => setState((s) => fireStaff(s, staffId))}
          />
          <DinoFactPanel
            dinosaur={selectedDinosaur}
            enclosure={selectedEnclosure}
            onClose={() => setSelectedDinosaurId(null)}
          />
        </div>
      </div>
    </div>
  )
}
