import React, { useEffect, useState } from 'react';
import { cloneDeep } from 'lodash';
// ! data
import { STANCE, initialBoxerDataOnForm } from '@/assets/boxerData';
import { ORGANIZATIONS, WEIGHT_CLASS } from '@/assets/boxerData';
import { COUNTRY } from '@/assets/NationalFlagData';
//! type
import { BoxerType, CountryType, StanceType } from '@/assets/types';
//! recoil
import { SetterOrUpdater, useRecoilState } from 'recoil';
import { boxerDataOnFormState } from '@/store/boxerDataOnFormState';
// ! component
import { Button } from '@/components/atomic/Button';

type PropsType = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending?: boolean;
  editTargetBoxerData?: BoxerType;
  isSuccess?: boolean;
  isGuard?: boolean;
};

export const BoxerEditForm = (props: PropsType) => {
  // ? recoil
  const [boxerDataOnForm, setBoxerDataToForm] =
    useRecoilState(boxerDataOnFormState);

  //? 登録が完了したらformのデータを初期化
  useEffect(() => {
    if (!props.isSuccess) return;
    setBoxerDataToForm(initialBoxerDataOnForm);
  }, [props.isSuccess]);

  return (
    <div className="p-10 bg-stone-200 border-stone-400 border-[1px]">
      <h1 className="text-3xl text-center">選手情報</h1>
      <form className="flex flex-col" onSubmit={props.onSubmit}>
        <Name
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Country
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Birth
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Height
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Reach
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Stance
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <BoxerResume
          boxerDataOnForm={boxerDataOnForm}
          setBoxerDataToForm={setBoxerDataToForm}
        />

        <Titles />

        <div className="relative mt-5">
          <Button styleName={'wide'}>登録</Button>
        </div>
      </form>
    </div>
  );
};

type DataEntryItemType = {
  boxerDataOnForm: BoxerType;
  setBoxerDataToForm: SetterOrUpdater<BoxerType>;
};

const Name = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
    <>
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="名前(英字表示)"
        name="eng_name"
        value={boxerDataOnForm?.eng_name}
        onChange={(e) =>
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, eng_name: e.target.value };
          })
        }
      />
      <input
        className="mt-3 px-1 rounded border-black"
        type="text"
        placeholder="選手名"
        name="name"
        value={boxerDataOnForm?.name}
        onChange={(e) =>
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, name: e.target.value };
          })
        }
      />
    </>
  );
};

const Country = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
    <div className="flex mt-3">
      <label className="w-[100px] text-center" htmlFor="country">
        国籍
      </label>
      <select
        className="w-[150px]"
        name="country"
        value={boxerDataOnForm?.country}
        onChange={(e) => {
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, country: e.target.value as CountryType };
          });
        }}
        id="country"
      >
        {/* <option value={undefined}>{countryUndefined}</option> */}
        {Object.values(COUNTRY)
          .sort()
          .map((nationalName) => (
            <option key={nationalName} value={nationalName}>
              {nationalName}
            </option>
          ))}
      </select>
    </div>
  );
};

const Birth = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
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
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, birth: e.target.value };
          })
        }
      />
    </div>
  );
};

const Height = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
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
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, height: Number(e.target.value) };
          })
        }
      />
    </div>
  );
};

const Reach = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
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
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, reach: Number(e.target.value) };
          })
        }
      />
    </div>
  );
};

const Stance = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
    <div className="mt-3 flex p-1">
      <label className="w-[100px] text-center" htmlFor="stance">
        スタイル:
      </label>
      <select
        className="w-[150px]"
        value={boxerDataOnForm?.style}
        onChange={(e) =>
          setBoxerDataToForm((current: BoxerType) => {
            return { ...current, style: e.target.value as StanceType };
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
  );
};

const BoxerResume = (props: DataEntryItemType) => {
  const { boxerDataOnForm, setBoxerDataToForm } = props;
  return (
    <div className="flex w-full">
      <div className="mt-3 flex p-1">
        <label htmlFor="win">win</label>
        <input
          className="w-full"
          value={boxerDataOnForm?.win}
          onChange={(e) =>
            setBoxerDataToForm((current: BoxerType) => {
              return { ...current, win: Number(e.target.value) };
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
            setBoxerDataToForm((current: BoxerType) => {
              return { ...current, ko: Number(e.target.value) };
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
            setBoxerDataToForm((current: BoxerType) => {
              return { ...current, draw: Number(e.target.value) };
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
            setBoxerDataToForm((current: BoxerType) => {
              return { ...current, lose: Number(e.target.value) };
            })
          }
          type="number"
          min="0"
          id="lose"
        />
      </div>
    </div>
  );
};

const Titles = () => {
  // ! use hook
  // ? タイトル入力欄(<input> <select>)の数を決める useState
  const [hasTitleCount, setHasTitleCount] = useState(1);

  const [boxerDataOnForm, setBoxerDataOnForm] =
    useRecoilState(boxerDataOnFormState);

  // ? 団体と階級を選択した場合入力欄を追加
  useEffect(() => {
    if (boxerDataOnForm.titles.length >= 4) {
      setHasTitleCount(4);
      return;
    }
    if (!boxerDataOnForm.titles.length) {
      setHasTitleCount(1);
      return;
    }
    const lastIndex = boxerDataOnForm.titles.length - 1;
    if (!boxerDataOnForm.titles[lastIndex]?.weight) return;
    setHasTitleCount(boxerDataOnForm.titles.length + 1);
  }, [boxerDataOnForm.titles]);

  return (
    <>
      <section className="mt-3">
        <p>保有タイトル</p>
        {[...Array(hasTitleCount)].map((_, i) => (
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
