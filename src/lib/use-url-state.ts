'use client'

import { useEffect } from 'react'

/** Mirrors tool state into the address bar without adding history entries or re-rendering the route. */
export function useUrlState(params: URLSearchParams) {
  const query = params.toString()
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}?${query}`)
    }, 200)
    return () => window.clearTimeout(timer)
  }, [query])
}
