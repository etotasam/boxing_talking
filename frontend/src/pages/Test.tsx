import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
export const Test = () => {
  const [comments, setComments] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const send = () => {
    setComments([...comments, comment]);
    setComment("");
  };
  const commentDelete = (index: number) => {
    if (!comments) return;
    const test = comments.filter((c, i) => i !== index);
    setComments(test);
  };
  return (
    <div>
      <div className="bg-blue-300">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="こめんと"
        />
        <button onClick={send}>送信</button>
      </div>
      <div className="">
        <ul>
          <AnimatePresence>
            {comments
              .map((c, i) => (
                <motion.li
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  key={i}
                >
                  <div className="mt-3 bg-red-300">
                    <span>{i}</span>
                    <p>{c}</p>
                    <span className="cursor-pointer" onClick={() => commentDelete(i)}>
                      ✕
                    </span>
                  </div>
                </motion.li>
              ))
              .reverse()}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};
