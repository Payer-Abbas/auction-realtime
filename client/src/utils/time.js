import dayjs from 'dayjs'

export function isoToLocalInput(iso) {
  // Convert ISO to value acceptable by <input type="datetime-local">
  return dayjs(iso).format('YYYY-MM-DDTHH:mm')
}

export function remainingMs(endIso) {
  const now = dayjs()
  const end = dayjs(endIso)
  const ms = end.diff(now)
  return ms > 0 ? ms : 0
}

export function formatCurrency(n) {
  const v = Number(n || 0)
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}
