import { useRef, useState } from 'react'

export default function useMutation() {
  const lock = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  async function run(operation) {
    if (lock.current) return
    lock.current = true
    setPending(true)
    setError(null)
    try {
      return await operation()
    } catch (failure) {
      setError(failure)
      return undefined
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  return { pending, error, run, clearError: () => setError(null) }
}
