import { useEffect, useState } from "react"
// !Recoil

export const useGetDevice = () => {

  const [device, setDevice] = useState<"PC" | "SP">()

  const getViewportWidth = () => {
    const width = document.documentElement.clientWidth
    const device = width > 900 ? "PC" : "SP"
    setDevice(device)
  }

  useEffect(() => {
    window.addEventListener("resize", getViewportWidth, false)
    return () => {
      window.removeEventListener("resize", getViewportWidth, false)
    }
  }, [])

  return { device }
}