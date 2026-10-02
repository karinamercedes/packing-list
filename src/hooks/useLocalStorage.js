import { useState, useEffect } from 'react'

// Same pattern as the travel-planner: state that also survives a page refresh.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage blocked or full; app still works, just won't persist
    }
  }, [key, value])

  return [value, setValue]
}
