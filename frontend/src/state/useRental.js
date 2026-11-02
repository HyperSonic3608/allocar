import { usePrototype } from './prototype-store.js'
import { vehicles, rentalDays, formatMoney, formatDate } from '../data/demo.js'

export default function useRental() {
  const { state, dispatch } = usePrototype()
  const vehicle = vehicles.find((item) => item.id === state.vehicleId) || vehicles[0]
  const days = rentalDays(state.start, state.end)
  return {
    state,
    dispatch,
    vehicle,
    days,
    total: days * vehicle.daily,
    price: formatMoney(days * vehicle.daily),
    period: `${formatDate(state.start)} a ${formatDate(state.end)}`,
    vehicleLabel: `${vehicle.name} · ${vehicle.year} · ${vehicle.plate}`,
  }
}
