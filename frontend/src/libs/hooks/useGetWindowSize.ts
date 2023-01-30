import React from "react"
import { useQueryState } from "./useQueryState"

export const useGetWindowSize = (): { width: number | undefined, height: number | undefined } => {
  const { state: size, setter: setSize } = useQueryState<{ width: number | undefined, height: number | undefined }>(`q/windowWidth`, { width: undefined, height: undefined })

  const getWindowSize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    setSize({ width, height })
  }

  React.useEffect(() => {
    getWindowSize()
    window.addEventListener('resize', getWindowSize, false)
    return () => {
      window.removeEventListener('resize', getWindowSize, false)
    }
  }, [])

  return { ...size }
}