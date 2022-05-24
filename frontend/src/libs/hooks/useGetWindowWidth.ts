import React from "react"

export const useGetWindowWidth = (): number => {
  const [width, setWidth] = React.useState(0)
  // const { state: windowWidth, setter } = useQueryState<number>("q/windowWidth", 0)

  const getWindowWidth = () => {
    const width = window.innerWidth
    setWidth(width)
  }

  React.useEffect(() => {
    getWindowWidth()
    window.addEventListener('resize', getWindowWidth, false)
    return () => {
      window.removeEventListener('resize', getWindowWidth, false)
    }
  }, [])

  return width
}