import React from "react"

export const useGetWindowSize = (): { width: number, height: number } => {
  const [size, setSize] = React.useState<{ width: number, height: number }>({ width: 0, height: 0 })
  // const { state: windowWidth, setter } = useQueryState<number>("q/windowWidth", 0)

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