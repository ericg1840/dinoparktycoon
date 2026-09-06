export const STAFF_TYPES = [
  {
    id: 'vet',
    label: 'Veterinarian',
    icon: '💉',
    salary: 90,
    description: 'Treats sick dinosaurs and lowers the chance of illness.',
  },
  {
    id: 'maintenance',
    label: 'Maintenance Worker',
    icon: '🔧',
    salary: 70,
    description: 'Repairs failing fences before they break down completely.',
  },
  {
    id: 'cook',
    label: 'Cook',
    icon: '🍖',
    salary: 60,
    description: 'Feeds the dinosaurs, keeping happiness up and cleanliness steady.',
  },
  {
    id: 'guide',
    label: 'Tour Guide',
    icon: '📣',
    salary: 55,
    description: 'Entertains visitors, boosting park reputation over time.',
  },
]

export function getStaffType(id) {
  return STAFF_TYPES.find((s) => s.id === id)
}
