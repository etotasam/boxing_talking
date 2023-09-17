import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const TestModule = () => {
  return (
    <>
      {/* //? 自身の投票と投票数 */}
      <section className="w-[500px]">
        <div className="flex justify-center mt-5">
          <div className="w-[80%]">
            <p className="text-center text-sm font-light">
              <span
                className={clsx(
                  'relative',
                  'after:absolute after:bottom-[-10px] after:left-[50%] after:translate-x-[-50%] after:border-b-[1px] after:border-stone-600 after:w-[115%]'
                )}
              >
                カネロの勝利に投票しました
              </span>
            </p>

            <div className="flex mt-5">
              <div className="flex-1 flex justify-between relative">
                <div className="w-[calc(60%-10px)]">
                  <span
                    className={clsx(
                      'block pl-3 text-lg font-semibold text-red-600 right-0 top-0',
                      "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1"
                    )}
                  >
                    153
                  </span>
                  <motion.div
                    className={clsx(
                      'left-[5px] h-[10px] flex justify-center items-center bg-red-500 relative',
                      'before:w-[10px] before:h-[10px] before:rounded-[50%] before:bg-red-500 before:absolute before:top-0 before:left-[-5px]',
                      'after:w-[10px] after:h-[10px] after:rounded-[50%] after:bg-red-500 after:absolute after:top-0 after:right-[-5px]'
                    )}
                  />
                </div>
                <div className="w-[calc(40%-10px)]">
                  <span
                    className={clsx(
                      'block text-right pr-3 text-lg font-semibold right-0 top-0',
                      "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1"
                    )}
                  >
                    3
                  </span>
                  <div className="relative">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: '100%',
                      }}
                      transition={{ duration: 3, ease: [0.25, 1, 0.5, 1] }}
                      className="absolute right-0"
                    >
                      <span
                        className={clsx(
                          'right-[5px] h-[10px] flex justify-center items-center bg-blue-500 relative',
                          'before:w-[10px] before:h-[10px] before:rounded-[50%] before:bg-blue-500 before:absolute before:top-0 before:left-[-5px]',
                          'after:w-[10px] after:h-[10px] after:rounded-[50%] after:bg-blue-500 after:absolute after:top-0 after:right-[-5px]'
                        )}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

//!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
