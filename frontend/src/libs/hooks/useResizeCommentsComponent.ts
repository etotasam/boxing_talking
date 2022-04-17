import React, { DependencyList } from "react";

export const useResizeCommentsComponent = (...ref: (HTMLDivElement | null)[]): void => {


  const calcCommentComponentHeight = () => {
    if (ref.some(el => el === null)) return
    const totalElHeight = ref.reduce((acc, curr) => {
      if (curr === null) return 0
      return acc + curr.clientHeight
    }, 0);
    const mainElHeight = window.innerHeight - 100;
    const height = Math.max(totalElHeight, mainElHeight);
    document.documentElement.style.setProperty("--comment-el-height", `${height}px`);
  }

  React.useEffect(() => {
    calcCommentComponentHeight()
    window.addEventListener('resize', calcCommentComponentHeight, false)
    return () => {
      window.removeEventListener('resize', calcCommentComponentHeight, false)
    }
  }, [ref])


}