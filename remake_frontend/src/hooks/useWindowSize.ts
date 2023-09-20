import { useEffect, useState } from "react"
// !Recoil

export const useWindowSize = () => {

  const [device, setDevice] = useState<"PC" | "SP">()
  const [windowSize, setWindowSize] = useState<number>()

  const getViewportWidth = () => {
    const width = window.innerWidth
    // const width = document.documentElement.offsetWidth
    const device = width > 900 ? "PC" : "SP"
    setDevice(device)
    setWindowSize(width)
  }

  useEffect(() => {
    getViewportWidth()
    window.addEventListener("resize", getViewportWidth, false)
    return () => {
      window.removeEventListener("resize", getViewportWidth, false)
    }
  }, [])

  return { device, windowSize }
}