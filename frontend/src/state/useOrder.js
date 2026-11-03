import { useCallback } from 'react'
import { api } from '../api/client.js'
import useResource from './useResource.js'

export default function useOrder(id) {
  return useResource(
    useCallback(
      async (signal) => {
        if (!id) return null
        const [detail, agents] = await Promise.all([api.order(id, signal), api.agents(signal)])
        return { ...detail, agents }
      },
      [id],
    ),
  )
}
