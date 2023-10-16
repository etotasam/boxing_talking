import clsx from 'clsx';
import { motion } from 'framer-motion';

export const TestModule = () => {
  const myData = {
    name: 'カネロ',
    red_count: 256,
    blue_count: 243,
  };
  const total = myData.red_count + myData.blue_count;
  const redRaito = Math.round((myData.red_count / total) * 100);
  const blueRaito = Math.round((myData.blue_count / total) * 100);

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

            <div className="flex justify-between mt-5">
              <span
                className={clsx(
                  'block pl-3 text-lg font-semibold text-red-600 right-0 top-0',
                  "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1"
                )}
              >
                {myData.red_count}
              </span>
              <span
                className={clsx(
                  'block text-right pr-3 text-lg font-semibold right-0 top-0',
                  "after:content-['票'] after:text-xs after:text-stone-500 after:ml-1"
                )}
              >
                {myData.blue_count}
              </span>
            </div>

            <div className="flex mt-0">
              <div className="flex-1 flex justify-between relative">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${redRaito}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="h-[10px] absolute top-0 left-[-1px] rounded-[50px] bg-red-600"
                  // style={{ width: `calc(${redRaito}%)` }}
                ></motion.div>

                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${blueRaito}%`,
                  }}
                  transition={{ duration: 2, ease: [0.25, 1, 0.5, 1] }}
                  className="h-[10px] absolute top-0 right-[-1px] rounded-[50px] bg-blue-600"
                  // style={{ width: `calc(${blueRaito}%)` }}
                ></motion.div>
                {/*  */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

//!@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
