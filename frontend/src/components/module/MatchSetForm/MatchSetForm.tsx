import React, { useEffect, useState } from 'react';
import { cloneDeep, pickBy, isEqual, pick } from 'lodash';
import dayjs from 'dayjs';
// ! types
import {
  CountryType,
  GradeType,
  WeightClassType,
  OrganizationsType,
  MatchDataType,
  MatchUpdateFormType,
} from '@/assets/types';
//!type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! data
import { WEIGHT_CLASS, ORGANIZATIONS, GRADE } from '@/assets/boxerData';
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from '@/assets/statusesOnToastModal';
import { COUNTRY } from '@/assets/NationalFlagData';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
import { useUpdateMatch } from '@/hooks/apiHooks/useMatch';
//! component
import { Button } from '@/components/atomic/Button';

export const MatchSetForm = ({
  selectedMatch,
  isSuccessDeleteMatch,
}: {
  selectedMatch: MatchDataType | undefined;
  isSuccessDeleteMatch?: boolean;
}) => {
  //? use hook
  const { hideToastModal, showToastModalMessage } = useToastModal();
  const { updateMatch } = useUpdateMatch();

  type formDataKeysType = keyof typeof initialFormData;
  const initialFormData = {
    match_date: '',
    grade: undefined,
    country: undefined,
    venue: '',
    weight: undefined,
    titles: [] as OrganizationsType[] | [],
  } as const;

  const [originalFormData, setOriginalFormData] =
    useState<MatchUpdateFormType>();
  const [formData, setFormData] =
    useState<MatchUpdateFormType>(initialFormData);
  const [isTitle, setIsTitle] = useState(false);
  const [counter, setCounter] = useState(1);

  //? matchTitles配列にnull,空文字が含まれていたら削除する
  useEffect(() => {
    if (formData.titles.some((title) => !title)) {
      setFormData((current) => {
        const titles = formData.titles.filter((data) => !!data);
        return { ...current, titles };
      });
    }
  }, [formData.titles]);

  //? 試合の削除が成功したらformの各データを初期化する
  useEffect(() => {
    if (!isSuccessDeleteMatch) return;
    setFormData(initialFormData);
  }, [isSuccessDeleteMatch]);

  //? 試合データを選択(props selectedMatch)した時に各値をformに表示出来る様にフォーマットしてセットする
  useEffect(() => {
    if (!selectedMatch) return;
    const pickData = pickDataForUpdate();

    setFormData(pickData);
    setOriginalFormData(pickData);

    if (selectedMatch.titles.length) {
      setIsTitle(true);
      const organizations = selectedMatch.titles
        .map((title) => {
          return title.organization;
        })
        .filter((v) => v !== undefined) as OrganizationsType[] | [];
      setFormData((current) => {
        return { ...current, titles: organizations };
      });
    } else {
      setIsTitle(false);
    }
  }, [selectedMatch]);

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);
  // ? gradeがタイトルマッチ以外の時は matchTitles (WBA WBCとか...)を空にする
  useEffect(() => {
    if (!isTitle) {
      setFormData((current) => {
        return { ...current, titles: [] };
      });
    }
  }, [isTitle]);

  // ? WBA WBC WBO IBFを選ぶ<select>の数を管理
  useEffect(() => {
    const matchTitles = formData.titles;
    if (matchTitles.length >= 4) {
      setCounter(4);
      return;
    }
    if (!matchTitles.length) {
      setCounter(1);
    } else {
      setCounter(matchTitles.length + 1);
    }
  }, [formData.titles]);

  //?グレードがタイトルマッチ以外の時はorganization(WBA,WBCとか…)を選べない様にする
  useEffect(() => {
    if (formData.grade === GRADE.TITLE_MATCH) {
      setIsTitle(true);
    } else {
      setIsTitle(false);
    }
  }, [formData.grade]);

  //? 試合が選択されていない場合モーダル表示
  const showModalIfNotSelectMatch = () => {
    if (!selectedMatch) {
      throw new Error(MESSAGE.MATCH_IS_NOT_SELECTED);
    }
  };

  // ? 未入力がある場合はモーダルでNOTICE
  const showModalIfUndefinedFieldsExist = () => {
    if (
      !formData.match_date ||
      !formData.grade ||
      !formData.country ||
      !formData.venue ||
      !formData.weight
    ) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    } else if (
      formData.grade === GRADE.TITLE_MATCH &&
      !formData.titles.length
    ) {
      throw new Error(MESSAGE.MATCH_HAS_NOT_ENTRIES);
    }
  };

  //?更新するのに必要なデータだけを抽出
  const pickDataForUpdate = (): MatchUpdateFormType => {
    const pickKeys = Object.keys(initialFormData) as formDataKeysType[];
    const pickData = pick(selectedMatch, pickKeys);
    const titles: OrganizationsType[] | [] = pickData.titles!.map((obj) => {
      return obj.organization;
    });
    const formattedPickData = { ...pickData, titles } as MatchUpdateFormType;
    return formattedPickData;
  };

  //? 現在のmatchデータと変更データを比較して、変更があるデータだけを抽出
  const pickModifiedData = (): Partial<MatchUpdateFormType> => {
    //? 変更のあるデータだけを抽出
    const extractData: Partial<MatchUpdateFormType> = pickBy(
      formData,
      (value, key) => {
        const formDataKey = key as formDataKeysType;
        if (formDataKey === 'titles') {
          return !isEqual(value, originalFormData!.titles);
        } else {
          return originalFormData![formDataKey] !== value;
        }
      }
    );
    return extractData;
  };

  //?データ変更が無い時モーダル表示
  const showModalIfDataNotChanged = (
    modifiedData: Partial<MatchUpdateFormType>
  ) => {
    if (!Object.keys(modifiedData).length) {
      throw new Error(MESSAGE.MATCH_IS_NOT_MODIFIED);
    }
  };

  const updateMatchExecute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showModalIfNotSelectMatch();
      showModalIfUndefinedFieldsExist();

      //? 現在のmatchデータと変更データを比較して、変更があるプロパティだけを抽出
      const modifiedData = pickModifiedData();

      showModalIfDataNotChanged(modifiedData);

      const matchId = selectedMatch!.id;

      updateMatch({ matchId, changeData: modifiedData });
    } catch (error: any) {
      //?MessageTypeには空文字も含まれている
      if (isMessageType(error.message) && error.message) {
        showToastModalMessage({
          message: error.message,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Has error when match update', error);
      }
    }
  };

  // ! DOM
  return (
    // <div className="bg-stone-200 flex justify-center items-center py-5 mt-5">
    <div>
      <form
        className="w-[400px] bg-stone-200 border-[1px] border-stone-400 p-5"
        onSubmit={updateMatchExecute}
      >
        <h2 className="text-center my-5 text-[26px] tracking-[0.1em]">
          試合情報
        </h2>
        {/* //? Match Date */}
        <div className="flex">
          {/* <div className="w-[100px] text-right"> */}
          <label className="w-[130px] text-right mr-3" htmlFor="match-date">
            試合日
          </label>
          {/* </div> */}
          <input
            className="w-[150px] p-1"
            id="match-date"
            type="date"
            min={dayjs().format('YYYY-MM-DD')}
            value={formData.match_date || dayjs().format('YYYY-MM-DD')}
            onChange={(e) => {
              setFormData((current) => {
                return { ...current, match_date: e.target.value };
              });
            }}
          />
        </div>

        {/* //? Match Grade */}
        <div className="flex mt-5">
          <label className="w-[130px] text-right mr-3" htmlFor="matchGrade">
            Match Grade:
          </label>
          <select
            className="w-[150px]"
            name="matchGrade"
            value={formData.grade}
            onChange={(e) => {
              setFormData((current) => {
                return { ...current, grade: e.target.value as GradeType };
              });
            }}
            id="matchGrade"
          >
            <option value={undefined}></option>
            {Object.values(GRADE).map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {isTitle && (
          <ul className="ml-[140px]">
            {/* //? タイトル */}
            {[...Array(counter)].map((_, i) => (
              <li className="mt-1" key={i}>
                <select
                  className="w-[150px]"
                  name="matchBelt"
                  value={formData.titles[i] ?? ''}
                  onChange={(e) => {
                    setFormData((current) => {
                      const cloneCurrent = cloneDeep(current);
                      cloneCurrent.titles[i] = e.target
                        .value as OrganizationsType;
                      return {
                        ...cloneCurrent,
                        titles: cloneCurrent.titles.filter((v) => !!v),
                      };
                    });
                  }}
                  id="matchBelt"
                >
                  <option value={undefined}></option>
                  {Object.values(ORGANIZATIONS).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        )}

        {/* //? Weight */}
        <div className="flex mt-5">
          <label className="w-[130px] text-right mr-3" htmlFor="matchWeight">
            契約ウエイト:
          </label>
          <select
            className="w-[150px]"
            name="matchWeight"
            value={formData.weight}
            onChange={(e) => {
              setFormData((current) => {
                return {
                  ...current,
                  weight: e.target.value as WeightClassType,
                };
              });
              // setMatchWeight(e.target.value as WeightClassType);
            }}
            id="matchWeight"
          >
            <option value={undefined}></option>
            {Object.values(WEIGHT_CLASS).map((weight) => (
              <option key={weight} value={weight}>
                {weight}
              </option>
            ))}
          </select>
        </div>

        {/* //? Match Place */}
        <div className="flex mt-5">
          <label
            className="w-[130px] text-right mr-3"
            htmlFor="matchPlaceCountry"
          >
            会場:
          </label>
          {/* //? 国旗用 国の選択 */}
          <select
            className="w-[150px]"
            name="matchPlaceCountry"
            value={formData.country}
            onChange={(e) => {
              setFormData((current) => {
                return {
                  ...current,
                  country: e.target.value as CountryType,
                };
              });
              // setMatchPlaceCountry(e.target.value as CountryType);
            }}
            id="matchPlaceCountry"
          >
            <option value={undefined}></option>
            {Object.values(COUNTRY).map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        {/* //? 会場 */}
        <div className="flex mt-2 ml-[140px]">
          <input
            className="w-full px-1 border-black"
            type="text"
            placeholder="試合会場入力"
            name="matchCountry"
            value={formData.venue}
            onChange={(e) => {
              setFormData((current) => {
                return { ...current, venue: e.target.value };
              });
              // setMatchVenue(e.target.value)
            }}
          />
        </div>

        <div className="w-full flex justify-center mt-5">
          <Button styleName="wide">登録</Button>
        </div>
      </form>
    </div>
  );
};
