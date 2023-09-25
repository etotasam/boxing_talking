import { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
// ! data
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/assets/boxerData';

// ! hooks
import { useBoxerDataOnForm } from '@/hooks/useBoxerDataOnForm';

export const TitleSelector = () => {
  // ! use hook
  // ? タイトル入力欄(<input> <select>)の数を決める useState
  const [countHasBelt, setCountHasBelt] = useState(1);

  const { state: boxerDataOnForm, setter: setBoxerDataOnForm } =
    useBoxerDataOnForm();

  // ? 団体と階級を選択した場合入力欄を追加
  useEffect(() => {
    if (boxerDataOnForm.titles.length >= 4) {
      setCountHasBelt(4);
      return;
    }
    if (!boxerDataOnForm.titles.length) {
      setCountHasBelt(1);
      return;
    }
    const lastIndex = boxerDataOnForm.titles.length - 1;
    if (!boxerDataOnForm.titles[lastIndex]?.weight) return;
    setCountHasBelt(boxerDataOnForm.titles.length + 1);
  }, [boxerDataOnForm.titles]);

  return (
    <>
      <section className="">
        <p>保有タイトル</p>
        {[...Array(countHasBelt)].map((_, i) => (
          <div key={i} className="flex">
            {/* //? 団体選択 */}
            <div className="mt-3 flex p-1">
              <select
                value={
                  boxerDataOnForm.titles[i]
                    ? boxerDataOnForm.titles[i].organization
                    : ''
                }
                onChange={(e) =>
                  setBoxerDataOnForm((boxerDataOnForm) => {
                    const cloneBoxerDataOnForm = cloneDeep(boxerDataOnForm);
                    if (!e.target.value) {
                      cloneBoxerDataOnForm.titles.splice(i, 1);
                      return cloneBoxerDataOnForm;
                    }
                    cloneBoxerDataOnForm.titles[i] = {
                      ...cloneBoxerDataOnForm.titles[i],
                      organization: e.target.value,
                    };
                    return cloneBoxerDataOnForm;
                  })
                }
              >
                <option value=""></option>
                {(
                  Object.keys(ORGANIZATIONS) as Array<
                    keyof typeof ORGANIZATIONS
                  >
                ).map((key) => (
                  <option key={key} value={ORGANIZATIONS[key]}>
                    {ORGANIZATIONS[key]}
                  </option>
                ))}
              </select>
            </div>
            {/* //? 階級選択 */}
            <div className="mt-3 flex p-1">
              <select
                value={
                  boxerDataOnForm.titles[i]
                    ? boxerDataOnForm.titles[i].weight
                    : ''
                }
                onChange={(e) =>
                  setBoxerDataOnForm((boxerDataOnForm) => {
                    const cloneBoxerDataOnForm = cloneDeep(boxerDataOnForm);
                    if (!e.target.value) {
                      cloneBoxerDataOnForm.titles.splice(i, 1);
                      return cloneBoxerDataOnForm;
                    }
                    cloneBoxerDataOnForm.titles[i] = {
                      ...cloneBoxerDataOnForm.titles[i],
                      weight: e.target.value,
                    };
                    return cloneBoxerDataOnForm;
                  })
                }
              >
                <option value=""></option>
                {(
                  Object.keys(WEIGHT_CLASS) as Array<keyof typeof WEIGHT_CLASS>
                ).map((key) => (
                  <option key={key} value={WEIGHT_CLASS[key]}>
                    {WEIGHT_CLASS[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </section>
    </>
  );
};
