import { useCallback, useEffect, useState } from 'react'

export default function useResource(loader) {
  const [revision, setRevision] = useState(0)
  const [resource, setResource] = useState({ data: null, loading: true, error: null })
  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return
        setResource({ data: null, loading: true, error: null, loader })
        return loader(controller.signal)
      })
      .then((data) => {
        if (!controller.signal.aborted) setResource({ data, loading: false, error: null, loader })
      })
      .catch((error) => {
        if (!controller.signal.aborted) setResource({ data: null, loading: false, error, loader })
      })
    return () => controller.abort()
  }, [loader, revision])
  const reload = useCallback(() => setRevision((value) => value + 1), [])
  const replace = useCallback(
    (data) => setResource({ data, loading: false, error: null, loader }),
    [loader],
  )
  return {
    ...(resource.loader === loader ? resource : { data: null, loading: true, error: null }),
    reload,
    replace,
  }
}
