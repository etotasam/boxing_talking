import { useEffect, useState } from 'react';
// ! recoil
import { useRecoilState } from 'recoil';
import { boxerCurrentState } from '@/store/boxerCurrentState';
//! types
import { LocalDataEntryType } from '../BoxerEditForm';
//! data
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/assets/boxerData';
//! types
import type { BoxerType, OrganizationsType, WeightClassType } from '@/assets/types';
// ! lodash
import { cloneDeep, get } from 'lodash';

export const Titles = (props: {
  titles: BoxerType['titles'];
  changeLocalBoxerData: LocalDataEntryType;
}) => {
  const { titles, changeLocalBoxerData } = props;
  // console.log(titles);
  // ! use hook
  // ? タイトル入力欄(<input> <select>)の数を決める useState
  const [hasTitleCount, setHasTitleCount] = useState(1);
  // console.log(hasTitleCount);

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
    if (!titles[lastIndex]?.weight || !titles[lastIndex]?.organization) return;
    setHasTitleCount(titles.length + 1);
  }, [titles]);

  // ? ローカルの titles を更新する関数 ※organization と weight の両方が空のものは除外する(hasTitleCount数をコントロールするため)
  const changeLocalTitles = (titles: BoxerType['titles']) => {
    changeLocalBoxerData(
      'titles',
      titles.filter((t) => t.organization)
    );
  };

  // TODO 選択可能な団体(WBA,WBCとか…)を返す関数(自身が持つタイトルは除外する)
  // ! 以下は違う階級の同じ団体のベルトは保持出来ない仕様になる。どういう仕様にするかを決める必要がある
  const getAvailableOrganizations = (titles: BoxerType['titles'], index: number) => {
    return (Object.keys(ORGANIZATIONS) as Array<keyof typeof ORGANIZATIONS>).filter((key) => {
      return !titles.some(
        (t, i) => index !== i && t.organization.slice(0, 3) === ORGANIZATIONS[key].slice(0, 3)
      );
    });
  };

  return (
    <>
      <section className="mt-3">
        <p>保有タイトル</p>
        {/* //? 団体選択 */}
        {[...Array(hasTitleCount)].map((_, i) => (
          <div key={i} className="flex">
            <div className="mt-3 flex p-1">
              <select
                name="organization"
                autoComplete="off"
                className="w-[100px]"
                value={titles[i]?.organization ?? ''}
                onChange={(e) => {
                  const newTitles = [...titles];
                  newTitles[i] = {
                    ...newTitles[i],
                    organization: e.target.value as OrganizationsType,
                    // weight: title.weight,
                  };
                  changeLocalTitles(newTitles);
                }}
              >
                <option value=""></option>
                {getAvailableOrganizations(titles, i).map((key) => (
                  <option key={key} value={ORGANIZATIONS[key]}>
                    {ORGANIZATIONS[key]}
                  </option>
                ))}
              </select>
            </div>
            {/* //? 階級選択 */}
            {/* //? 団体を選択した済み時のみ表示させる */}
            {titles[i]?.organization && (
              <div className="mt-3 flex p-1">
                <select
                  name="weight"
                  autoComplete="off"
                  className="w-[200px]"
                  value={titles[i]?.weight ?? ''}
                  onChange={(e) => {
                    const newTitles = [...titles];
                    newTitles[i] = {
                      ...newTitles[i],
                      weight: e.target.value as WeightClassType,
                    };
                    changeLocalTitles(newTitles);
                  }}
                >
                  <option value=""></option>
                  {(Object.keys(WEIGHT_CLASS) as Array<keyof typeof WEIGHT_CLASS>).map((key) => (
                    <option key={key} value={WEIGHT_CLASS[key]}>
                      {WEIGHT_CLASS[key]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
};
