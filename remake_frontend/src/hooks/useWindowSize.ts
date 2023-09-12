import { useEffect, useState } from "react"
// !Recoil

export const useWindowSize = () => {

  const [windowSize, setWindowSize] = useState<"PC" | "SP">()

  const getViewportWidth = () => {
    const width = document.documentElement.clientWidth
    const device = width > 900 ? "PC" : "SP"
    setWindowSize(device)
  }

  useEffect(() => {
    getViewportWidth()
    window.addEventListener("resize", getViewportWidth, false)
    return () => {
      window.removeEventListener("resize", getViewportWidth, false)
    }
  }, [])

  return { windowSize }
}