import React, { DependencyList, useState, useEffect } from "react";

export const useAdjustCommentsContainer = ([...ref]: (React.RefObject<HTMLDivElement> | null)[]): void => {

  const headerAndFooterHeight = 150
  const [allHeight, setAllHeight] = useState(0)

  const calcCommentComponentHeight = () => {
    if (ref.some(el => el === null)) return
    const totalElHeight = ref.reduce((acc, curr) => {
      if (curr === null) return 0
      const el = curr.current as HTMLDivElement
      return acc + el.clientHeight
    }, 0);
    const mainElHeight = window.innerHeight - headerAndFooterHeight;
    const height = Math.max(totalElHeight, mainElHeight);
    document.documentElement.style.setProperty("--comment-el-height", `${height}px`);
  }

  useEffect(() => {
    calcCommentComponentHeight()
  }, [allHeight])

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const height = entries.reduce((acc, curr) => {
        return acc + curr.contentRect.height
      }, 0)
      setAllHeight(height);
    });

    ref.forEach(ref => {
      ref?.current && observer.observe(ref.current);
    })

    calcCommentComponentHeight()
    window.addEventListener('resize', calcCommentComponentHeight, false)
    return () => {
      window.removeEventListener('resize', calcCommentComponentHeight, false)
    }
  }, [])
}