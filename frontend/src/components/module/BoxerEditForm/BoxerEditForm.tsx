import React, { useEffect } from 'react';
// ! data
import { STANCE, initialBoxerDataOnForm } from '@/assets/boxerData';
import { NATIONALITY } from '@/assets/NationalFlagData';
//! type
import { BoxerType } from '@/assets/types';
//! recoil
import { useRecoilState } from 'recoil';
import { boxerDataOnFormState } from '@/store/boxerDataOnFormState';
// ! component
import { TitleSelector } from './TitleSelector';

type PropsType = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  editTargetBoxerData?: BoxerType;
  isSuccess?: boolean;
  isGuard?: boolean;
};

const countryUndefined = '国籍の選択';

export const BoxerEditForm = (props: PropsType) => {
  // ? recoil
  const [boxerDataOnForm, setBoxerDataToForm] =
    useRecoilState(boxerDataOnFormState);

  // ? 入力させない様にするガードモーダル
  // const { isGuard = false } = props;

  //? 登録が完了したらformのデータを初期化
  useEffect(() => {
    if (!props.isSuccess) return;
    setBoxerDataToForm(initialBoxerDataOnForm);
  }, [props.isSuccess]);

  return (
    // <div className={`${props.className}`}>
    <div className="p-10 bg-stone-200 border-stone-400 border-[1px]">
      <h1 className="text-3xl text-center">選手情報</h1>
      <form className="flex flex-col" onSubmit={props.onSubmit}>
        {/* //? name */}
        <input
          className="mt-3 px-1 bourder rounded border-black"
          type="text"
          placeholder="名前(英字表示)"
          name="eng_name"
          value={boxerDataOnForm?.eng_name}
          onChange={(e) =>
            setBoxerDataToForm((prev: any) => {
              return { ...prev, eng_name: e.target.value };
            })
          }
        />
        <input
          className="mt-3 px-1 bourder rounded border-black"
          type="text"
          placeholder="選手名"
          name="name"
          value={boxerDataOnForm?.name}
          onChange={(e) =>
            setBoxerDataToForm((prev: any) => {
              return { ...prev, name: e.target.value };
            })
          }
        />
        {/* //? country */}
        <div className="flex mt-3">
          <label className="w-[100px] text-center" htmlFor="country">
            国籍
          </label>
          <select
            className="w-[150px]"
            name="country"
            value={boxerDataOnForm?.country}
            onChange={(e) => {
              if (e.target.value === countryUndefined) {
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, country: undefined };
                });
              } else {
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, country: e.target.value };
                });
              }
            }}
            id="country"
          >
            <option value={undefined}>{countryUndefined}</option>
            {Object.values(NATIONALITY).map((nationalName) => (
              <option key={nationalName} value={nationalName}>
                {nationalName}
              </option>
            ))}
          </select>
        </div>
        {/* //? birth */}
        <div className="flex mt-3">
          <label className="w-[100px] text-center" htmlFor="birth">
            生年月日
          </label>
          <input
            className="px-1 w-[150px]"
            type="date"
            id="birth"
            min="1970-01-01"
            value={boxerDataOnForm?.birth}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, birth: e.target.value };
              })
            }
          />
        </div>
        {/* //? height */}
        <div className="mt-3 flex p-1">
          <label className="w-[100px] text-center" htmlFor="height">
            身長
          </label>
          <input
            id="height"
            className="px-1 w-[150px]"
            type="number"
            min="0"
            value={boxerDataOnForm?.height}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, height: e.target.value };
              })
            }
          />
        </div>
        {/* //? reach */}
        <div className="mt-3 flex p-1">
          <label className="w-[100px] text-center" htmlFor="height">
            リーチ
          </label>
          <input
            id="reach"
            className="px-1 w-[150px]"
            type="number"
            min="0"
            value={boxerDataOnForm?.reach}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, reach: e.target.value };
              })
            }
          />
        </div>

        {/* //? stance */}
        <div className="mt-3 flex p-1">
          <label className="w-[100px] text-center" htmlFor="stance">
            スタイル:
          </label>
          <select
            className="w-[150px]"
            value={boxerDataOnForm?.style}
            onChange={(e) =>
              setBoxerDataToForm((prev: any) => {
                return { ...prev, style: e.target.value };
              })
            }
            name="boxing-style"
            id="stance"
          >
            <option value={STANCE.ORTHODOX}>{STANCE.ORTHODOX}</option>
            <option value={STANCE.SOUTHPAW}>{STANCE.SOUTHPAW}</option>
            <option value={STANCE.UNKNOWN}>{STANCE.UNKNOWN}</option>
          </select>
        </div>

        {/* //? 戦績 */}
        <div className="flex w-full">
          <div className="mt-3 flex p-1">
            <label htmlFor="win">win</label>
            <input
              className="w-full"
              value={boxerDataOnForm?.win}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, win: e.target.value };
                })
              }
              type="number"
              min="0"
              id="win"
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="ko">ko</label>
            <input
              className="w-full"
              value={boxerDataOnForm?.ko}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, ko: e.target.value };
                })
              }
              type="number"
              min="0"
              id="ko"
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="draw">draw</label>
            <input
              className="w-full"
              value={boxerDataOnForm?.draw}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, draw: e.target.value };
                })
              }
              type="number"
              min="0"
              id="draw"
            />
          </div>

          <div className="mt-3 flex p-1">
            <label htmlFor="lose">lose</label>
            <input
              className="w-full"
              value={boxerDataOnForm?.lose}
              onChange={(e) =>
                setBoxerDataToForm((prev: any) => {
                  return { ...prev, lose: e.target.value };
                })
              }
              type="number"
              min="0"
              id="lose"
            />
          </div>
        </div>

        {/* //? ベルト */}
        <div className="mt-3">
          <TitleSelector />
        </div>

        <div className="relative mt-5">
          <button
            className={`w-full duration-300 py-2 px-2 tracking-[0.5em] rounded bg-stone-600 hover:bg-stone-700 text-white`}
          >
            登録
          </button>
        </div>
      </form>
    </div>
    // </div>
  );
};
