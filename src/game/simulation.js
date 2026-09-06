import { getSpecies } from '../data/dinosaurSpecies.js'
import { getStaffType } from '../data/staffTypes.js'

const DAYS_PER_QUARTER = 90
const DAILY_LOAN_RATE = 0.001 // ~ compounding daily interest on the loan
const ENCLOSURE_BASE_COST = 800
const ELECTRIC_UPGRADE_COST = 1200

let idCounter = 1
function nextId(prefix) {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

export function createInitialState() {
  const enclosureA = {
    id: nextId('enc'),
    name: 'Paddock A',
    fenceType: 'basic',
    fenceHealth: 100,
    capacity: 6,
    dinosaurIds: [],
  }
  const enclosureB = {
    id: nextId('enc'),
    name: 'Paddock B',
    fenceType: 'basic',
    fenceHealth: 100,
    capacity: 6,
    dinosaurIds: [],
  }

  return {
    day: 1,
    quarter: 1,
    year: 1,
    cash: 5000,
    loan: 5000,
    reputation: 50,
    ticketPrice: 15,
    cleanliness: 85,
    enclosures: [enclosureA, enclosureB],
    dinosaurs: [],
    staff: [],
    quarterStats: emptyQuarterStats(5000),
    warnings: [],
    events: [],
    lastQuarterReport: null,
    lastVisitors: 0,
    lastRevenue: 0,
    gameOver: false,
  }
}

function emptyQuarterStats(startCash) {
  return {
    startCash,
    ticketRevenue: 0,
    staffCost: 0,
    interestCost: 0,
    incidentCost: 0,
    capitalSpend: 0,
    visitorTotal: 0,
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function enclosureSpaceUsed(enclosure, dinosaurs) {
  return enclosure.dinosaurIds.reduce((sum, id) => {
    const d = dinosaurs.find((x) => x.id === id)
    if (!d) return sum
    const species = getSpecies(d.speciesId)
    return sum + (species ? species.space : 0)
  }, 0)
}

export function enclosureFreeSpace(state, enclosureId) {
  const enclosure = state.enclosures.find((e) => e.id === enclosureId)
  if (!enclosure) return 0
  return enclosure.capacity - enclosureSpaceUsed(enclosure, state.dinosaurs)
}

// --- Player actions -------------------------------------------------------

export function buyDinosaur(state, speciesId, enclosureId, name) {
  const species = getSpecies(speciesId)
  if (!species) return state
  if (state.cash < species.cost) return state
  const free = enclosureFreeSpace(state, enclosureId)
  if (free < species.space) return state

  const dino = {
    id: nextId('dino'),
    speciesId,
    name: name || species.name,
    enclosureId,
    happiness: 75,
    health: 100,
    sick: false,
  }

  const enclosures = state.enclosures.map((e) =>
    e.id === enclosureId ? { ...e, dinosaurIds: [...e.dinosaurIds, dino.id] } : e,
  )

  return {
    ...state,
    cash: state.cash - species.cost,
    dinosaurs: [...state.dinosaurs, dino],
    enclosures,
    quarterStats: {
      ...state.quarterStats,
      capitalSpend: state.quarterStats.capitalSpend + species.cost,
    },
  }
}

export function buildEnclosure(state, name) {
  if (state.cash < ENCLOSURE_BASE_COST) return state
  const enclosure = {
    id: nextId('enc'),
    name: name || `Paddock ${String.fromCharCode(65 + state.enclosures.length)}`,
    fenceType: 'basic',
    fenceHealth: 100,
    capacity: 6,
    dinosaurIds: [],
  }
  return {
    ...state,
    cash: state.cash - ENCLOSURE_BASE_COST,
    enclosures: [...state.enclosures, enclosure],
    quarterStats: {
      ...state.quarterStats,
      capitalSpend: state.quarterStats.capitalSpend + ENCLOSURE_BASE_COST,
    },
  }
}

export function upgradeFence(state, enclosureId) {
  const enclosure = state.enclosures.find((e) => e.id === enclosureId)
  if (!enclosure || enclosure.fenceType === 'electric') return state
  if (state.cash < ELECTRIC_UPGRADE_COST) return state
  return {
    ...state,
    cash: state.cash - ELECTRIC_UPGRADE_COST,
    enclosures: state.enclosures.map((e) =>
      e.id === enclosureId ? { ...e, fenceType: 'electric', fenceHealth: 100 } : e,
    ),
    quarterStats: {
      ...state.quarterStats,
      capitalSpend: state.quarterStats.capitalSpend + ELECTRIC_UPGRADE_COST,
    },
  }
}

export function hireStaff(state, typeId) {
  const type = getStaffType(typeId)
  if (!type) return state
  const staffMember = {
    id: nextId('staff'),
    typeId,
    name: `${type.label} ${state.staff.filter((s) => s.typeId === typeId).length + 1}`,
  }
  return { ...state, staff: [...state.staff, staffMember] }
}

export function fireStaff(state, staffId) {
  return { ...state, staff: state.staff.filter((s) => s.id !== staffId) }
}

export function setTicketPrice(state, price) {
  return { ...state, ticketPrice: clamp(Math.round(price), 1, 100) }
}

export function payLoan(state, amount) {
  const pay = Math.min(amount, state.cash, state.loan)
  if (pay <= 0) return state
  return { ...state, cash: state.cash - pay, loan: state.loan - pay }
}

export const COSTS = {
  ENCLOSURE_BASE_COST,
  ELECTRIC_UPGRADE_COST,
}

// --- Simulation -------------------------------------------------------------

export function advanceDay(state) {
  if (state.gameOver) return state

  const staffCounts = state.staff.reduce((acc, s) => {
    acc[s.typeId] = (acc[s.typeId] || 0) + 1
    return acc
  }, {})
  const vetCount = staffCounts.vet || 0
  const maintCount = staffCounts.maintenance || 0
  const cookCount = staffCounts.cook || 0
  const guideCount = staffCounts.guide || 0

  const events = []

  // 1. Fence degradation & repair
  let enclosures = state.enclosures.map((enclosure) => {
    const dinosInside = enclosure.dinosaurIds
      .map((id) => state.dinosaurs.find((d) => d.id === id))
      .filter(Boolean)
    const hasDangerous = dinosInside.some((d) => getSpecies(d.speciesId)?.dangerous)
    const overcrowded = enclosureSpaceUsed(enclosure, state.dinosaurs) > enclosure.capacity

    let degrade = enclosure.fenceType === 'electric' ? 1.5 : 3.5
    if (hasDangerous) degrade *= 1.6
    if (overcrowded) degrade *= 1.3

    const repair = maintCount * 6
    let fenceHealth = clamp(enclosure.fenceHealth - degrade + repair, 0, 100)

    return { ...enclosure, fenceHealth, _hasDangerous: hasDangerous, _overcrowded: overcrowded }
  })

  // 2. Breakout check
  let reputationDelta = 0
  let incidentCost = 0
  let dinosaurs = [...state.dinosaurs]

  enclosures = enclosures.map((enclosure) => {
    if (enclosure.fenceHealth <= 0 && enclosure._hasDangerous && enclosure.dinosaurIds.length > 0) {
      const escapedId = enclosure.dinosaurIds[0]
      const escaped = dinosaurs.find((d) => d.id === escapedId)
      dinosaurs = dinosaurs.filter((d) => d.id !== escapedId)
      reputationDelta -= 25
      incidentCost += 1500
      events.push({
        id: nextId('event'),
        type: 'breakout',
        day: state.day,
        message: `${escaped ? escaped.name : 'A dinosaur'} broke out of ${enclosure.name}! The fence failed completely. Emergency costs and a reputation hit followed.`,
      })
      return {
        ...enclosure,
        fenceHealth: 40,
        dinosaurIds: enclosure.dinosaurIds.filter((id) => id !== escapedId),
      }
    }
    return enclosure
  })

  // 3. Dinosaur happiness / health / sickness
  dinosaurs = dinosaurs.map((dino) => {
    const enclosure = enclosures.find((e) => e.id === dino.enclosureId)
    const species = getSpecies(dino.speciesId)
    if (!enclosure || !species) return dino

    let happinessDelta = 0
    if (enclosure._overcrowded) happinessDelta -= 6
    if (cookCount > 0) happinessDelta += cookCount * 2
    else happinessDelta -= 3
    if (enclosure.fenceHealth < 40) happinessDelta -= 4
    if (enclosure.fenceType === 'electric' && species.dangerous) happinessDelta += 2

    let happiness = clamp(dino.happiness + happinessDelta, 0, 100)

    let sick = dino.sick
    let health = dino.health
    if (!sick && happiness < 35) {
      const sicknessChance = 0.12 - vetCount * 0.03
      if (Math.random() < Math.max(0.01, sicknessChance)) sick = true
    }

    if (sick) {
      if (vetCount > 0) {
        health = clamp(health + vetCount * 8, 0, 100)
        if (Math.random() < 0.25 + vetCount * 0.1) sick = false
      } else {
        health = clamp(health - 5, 0, 100)
      }
    } else {
      health = clamp(health + 1, 0, 100)
    }

    return { ...dino, happiness, sick, health }
  })

  // 4. Dinosaur death check
  const survivors = []
  for (const dino of dinosaurs) {
    if (dino.health <= 0) {
      reputationDelta -= 15
      events.push({
        id: nextId('event'),
        type: 'death',
        day: state.day,
        message: `${dino.name} did not survive its illness. Untreated sickness can be fatal — hire vets to prevent this.`,
      })
      enclosures = enclosures.map((e) =>
        e.id === dino.enclosureId ? { ...e, dinosaurIds: e.dinosaurIds.filter((id) => id !== dino.id) } : e,
      )
    } else {
      survivors.push(dino)
    }
  }
  dinosaurs = survivors

  // 5. Cleanliness
  let cleanliness = state.cleanliness
  cleanliness += maintCount * 3 + cookCount * 1
  cleanliness -= Math.max(0, Math.floor(state.lastVisitors / 15))
  cleanliness = clamp(cleanliness, 0, 100)

  // 6. Reputation drift
  reputationDelta += guideCount * 0.8
  reputationDelta += cleanliness > 70 ? 0.3 : cleanliness < 30 ? -0.8 : 0
  const sickCount = dinosaurs.filter((d) => d.sick).length
  reputationDelta -= sickCount * 0.5
  const unhappyCount = dinosaurs.filter((d) => d.happiness < 40).length
  reputationDelta -= unhappyCount * 0.3
  let reputation = clamp(state.reputation + reputationDelta, 0, 100)

  // 7. Visitors & revenue
  const priceFactor = clamp(1 - (state.ticketPrice - 10) / 60, 0.2, 1.4)
  const baseVisitors = (reputation / 100) * 300 * priceFactor * (cleanliness / 100)
  const visitors = Math.max(0, Math.round(baseVisitors * (0.85 + Math.random() * 0.3)))
  const ticketRevenue = visitors * state.ticketPrice

  // 8. Expenses
  const staffCost = state.staff.reduce((sum, s) => sum + (getStaffType(s.typeId)?.salary || 0), 0)
  const interestCost = Math.round(state.loan * DAILY_LOAN_RATE)
  const loan = state.loan + interestCost

  const cash = state.cash + ticketRevenue - staffCost - incidentCost

  const quarterStats = {
    ...state.quarterStats,
    ticketRevenue: state.quarterStats.ticketRevenue + ticketRevenue,
    staffCost: state.quarterStats.staffCost + staffCost,
    interestCost: state.quarterStats.interestCost + interestCost,
    incidentCost: state.quarterStats.incidentCost + incidentCost,
    visitorTotal: state.quarterStats.visitorTotal + visitors,
  }

  // 9. Warnings (recomputed fresh each day)
  const warnings = []
  dinosaurs.forEach((dino) => {
    const species = getSpecies(dino.speciesId)
    if (dino.sick) {
      warnings.push({ id: `sick-${dino.id}`, severity: 'high', message: `${dino.name} is sick and needs a vet.` })
    } else if (dino.happiness < 35) {
      warnings.push({ id: `unhappy-${dino.id}`, severity: 'medium', message: `${dino.name} is unhappy (${species?.name}).` })
    }
  })
  enclosures.forEach((enclosure) => {
    if (enclosure.fenceHealth < 30 && enclosure.dinosaurIds.length > 0) {
      warnings.push({
        id: `fence-${enclosure.id}`,
        severity: enclosure.fenceHealth < 15 ? 'critical' : 'high',
        message: `${enclosure.name} fence is failing (${Math.round(enclosure.fenceHealth)}%). Breakout risk!`,
      })
    }
    if (enclosure._overcrowded) {
      warnings.push({ id: `crowd-${enclosure.id}`, severity: 'medium', message: `${enclosure.name} is overcrowded.` })
    }
  })
  if (cash < 0) {
    warnings.push({ id: 'bankrupt', severity: 'critical', message: 'Cash on hand is negative! The bank is concerned.' })
  }

  let day = state.day + 1
  let quarter = state.quarter
  let year = state.year
  let lastQuarterReport = state.lastQuarterReport
  let nextQuarterStats = quarterStats

  let gameOver = state.gameOver
  if (cash < -3000 && loan > 15000) {
    gameOver = true
    events.push({
      id: nextId('event'),
      type: 'gameover',
      day: state.day,
      message: 'The park has gone bankrupt. Debts could not be paid.',
    })
  }

  if (day > DAYS_PER_QUARTER) {
    day = 1
    quarter += 1
    if (quarter > 4) {
      quarter = 1
      year += 1
    }
    const income = quarterStats.ticketRevenue
    const expenses = quarterStats.staffCost + quarterStats.interestCost + quarterStats.incidentCost + quarterStats.capitalSpend
    lastQuarterReport = {
      quarter: quarter === 1 ? 4 : quarter - 1,
      year: quarter === 1 && year > state.year ? state.year : year,
      income,
      expenses,
      profit: income - expenses,
      breakdown: { ...quarterStats },
    }
    nextQuarterStats = emptyQuarterStats(cash)
  }

  return {
    ...state,
    day,
    quarter,
    year,
    cash,
    loan,
    reputation,
    cleanliness,
    enclosures: enclosures.map(({ _hasDangerous, _overcrowded, ...rest }) => rest),
    dinosaurs,
    quarterStats: nextQuarterStats,
    warnings,
    events: [...events, ...state.events].slice(0, 20),
    lastQuarterReport,
    lastVisitors: visitors,
    lastRevenue: ticketRevenue,
    gameOver,
  }
}

export function advanceToNextQuarter(state) {
  let current = state
  const startQuarter = current.quarter
  let guard = 0
  while (current.quarter === startQuarter && !current.gameOver && guard < DAYS_PER_QUARTER + 1) {
    current = advanceDay(current)
    guard += 1
  }
  return current
}

export function dismissEvent(state, eventId) {
  return { ...state, events: state.events.filter((e) => e.id !== eventId) }
}
