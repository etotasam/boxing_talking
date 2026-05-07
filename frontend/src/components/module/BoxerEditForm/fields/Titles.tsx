//! types
import { LocalDataEntryType } from '@/page/Admin/BoxerEdit';
//! data
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/constants/boxerData';
//! types
import type { BoxerType, OrganizationsType, WeightClassType } from '@/types';

export const Titles = (props: {
  titles: BoxerType['titles'];
  setBoxerFieldData: LocalDataEntryType;
}) => {
  const { titles, setBoxerFieldData } = props;
  // ? タイトル入力欄の表示数を titles から算出
  const hasTitleCount = (() => {
    if (titles.length >= 4) return 4;
    if (!titles.length) return 1;
    const last = titles[titles.length - 1];
    if (!last?.weight || !last?.organization) return titles.length;
    return titles.length + 1;
  })();

  // ? ローカルの titles を更新する関数 ※organization と weight の両方が空のものは除外する(hasTitleCount数をコントロールするため)
  const changeLocalTitles = (titles: BoxerType['titles']) => {
    setBoxerFieldData(
      'titles',
      titles.filter((t) => t.organization)
    );
  };

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
