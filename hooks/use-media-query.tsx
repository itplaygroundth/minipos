//import * as React from "react"

// export function useMediaQuery(query: string) {
//   const [value, setValue] = React.useState(false)

//   React.useEffect(() => {
//     function onChange(event: MediaQueryListEvent) {
//       setValue(event.matches)
//     }

//     const result = matchMedia(query)
//     result.addEventListener("change", onChange)
//     setValue(result.matches)

//     return () => result.removeEventListener("change", onChange)
//   }, [query])

//   return value
// }

import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}