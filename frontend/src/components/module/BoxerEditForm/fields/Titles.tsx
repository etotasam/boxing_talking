import { useEffect, useState } from 'react';
// ! recoil
import { useRecoilState } from 'recoil';
import { boxerDataOnFormState } from '@/store/boxerDataOnFormState';
//! types
import { LocalDataEntryType } from '../BoxerEditForm';
//! data
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/assets/boxerData';
//! types
import type { BoxerType, OrganizationsType, WeightClassType } from '@/assets/types';
// ! lodash
import { cloneDeep } from 'lodash';

export const Titles = (props: {
  titles: BoxerType['titles'];
  changeLocalBoxerData: LocalDataEntryType;
}) => {
  const { titles, changeLocalBoxerData } = props;
  // ! use hook
  // ? タイトル入力欄(<input> <select>)の数を決める useState
  const [hasTitleCount, setHasTitleCount] = useState(1);

  // const [boxerDataOnForm, setBoxerDataOnForm] = useRecoilState(boxerDataOnFormState);

  // ? 団体と階級を選択した場合入力欄を追加
  useEffect(() => {
    if (titles.length >= 4) {
      setHasTitleCount(4);
      return;
    }
    if (!titles.length) {
      setHasTitleCount(1);
      return;
    }
    const lastIndex = titles.length - 1;
    if (!titles[lastIndex]?.weight) return;
    setHasTitleCount(titles.length + 1);
  }, [titles]);

  return (
    <>
      <section className="mt-3">
        <p>保有タイトル</p>
        {/* //? 団体選択 */}
        {[...Array(hasTitleCount)].map((_, i) => (
          <div key={i} className="flex">
            <div className="mt-3 flex p-1">
              <select
                value={titles[i] ? titles[i].organization : ''}
                onChange={
                  (e) => {
                    if (!e.target.value) {
                      changeLocalBoxerData(
                        'titles',
                        titles.filter((_, index) => index !== i)
                      );
                      return;
                    }

                    titles[i] = {
                      organization: e.target.value as OrganizationsType,
                      weight: titles[i]?.weight,
                    };
                    changeLocalBoxerData('titles', titles);
                  }
                  // setBoxerDataOnForm((boxerDataOnForm) => {
                  //   const cloneBoxerDataOnForm = cloneDeep(boxerDataOnForm);
                  //   if (!e.target.value) {
                  //     cloneBoxerDataOnForm.titles.splice(i, 1);
                  //     return cloneBoxerDataOnForm;
                  //   }
                  //   cloneBoxerDataOnForm.titles[i] = {
                  //     ...cloneBoxerDataOnForm.titles[i],
                  //     organization: e.target.value as OrganizationsType,
                  //   };
                  //   return cloneBoxerDataOnForm;
                  // })
                }
              >
                <option value=""></option>
                {(Object.keys(ORGANIZATIONS) as Array<keyof typeof ORGANIZATIONS>).map((key) => (
                  <option key={key} value={ORGANIZATIONS[key]}>
                    {ORGANIZATIONS[key]}
                  </option>
                ))}
              </select>
            </div>
            {/* //? 階級選択 */}
            <div className="mt-3 flex p-1">
              {/* <select
                value={boxerDataOnForm.titles[i] ? boxerDataOnForm.titles[i].weight : ''}
                onChange={(e) =>
                  setBoxerDataOnForm((boxerDataOnForm) => {
                    const cloneBoxerDataOnForm = cloneDeep(boxerDataOnForm);
                    if (!e.target.value) {
                      cloneBoxerDataOnForm.titles.splice(i, 1);
                      return cloneBoxerDataOnForm;
                    }
                    cloneBoxerDataOnForm.titles[i] = {
                      ...cloneBoxerDataOnForm.titles[i],
                      weight: e.target.value as WeightClassType,
                    };
                    return cloneBoxerDataOnForm;
                  })
                }
              >
                <option value=""></option>
                {(Object.keys(WEIGHT_CLASS) as Array<keyof typeof WEIGHT_CLASS>).map((key) => (
                  <option key={key} value={WEIGHT_CLASS[key]}>
                    {WEIGHT_CLASS[key]}
                  </option>
                ))}
              </select> */}
            </div>
          </div>
        ))}
      </section>
    </>
  );
};
