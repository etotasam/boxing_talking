import { useEffect } from "react"
// !Recoil
import { useRecoilState } from "recoil"
import { elementSizeState } from "@/store/elementSizeState"
import { deviceState } from "@/store/deviceState"

export const useWindowSize = () => {

  const [windowSize, setWindowSize] = useRecoilState<number | undefined>(elementSizeState('WINDOW_WIDTH'))
  const [device, setDevice] = useRecoilState(deviceState)


  const getViewportWidth = () => {
    const width = window.innerWidth
    if (width) {
      const newDevice = width > 950 ? "PC" : "SP"
      setDevice(newDevice)
      setWindowSize(width)
    }
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