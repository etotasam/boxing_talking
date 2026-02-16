import { useCallback } from 'react'
import { useRecoilState } from 'recoil'
//! store
import { fullScreenLoadingState } from '@/store/fullScreenLoadingState'

export const useFullScreenLoading = () => {
  const [isLoading, setIsLoading] = useRecoilState(fullScreenLoadingState)

  const showFullScreenLoading = useCallback(() => {
    setIsLoading(true)
  }, [setIsLoading])

  const hideFullScreenLoading = useCallback(() => {
    setIsLoading(false)
  }, [setIsLoading])

  return { isLoading, showFullScreenLoading, hideFullScreenLoading }
}
