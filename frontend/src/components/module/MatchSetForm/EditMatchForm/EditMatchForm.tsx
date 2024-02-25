import { useState, useEffect, useContext } from 'react';
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from '@/assets/statusesOnToastModal';
import { pickBy, isEqual, pick } from 'lodash';
//! type
import {
  MatchDataType,
  MatchUpdateFormType,
  OrganizationsType,
} from '@/assets/types';
//! hook
import { useToastModal } from '@/hooks/useToastModal';
import { useUpdateMatch } from '@/hooks/apiHooks/useMatch';
//! data
import { GRADE } from '@/assets/boxerData';
//!type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! component
import { MatchSetFormContainer } from '../MatchSetFormContainer';
//! context
import { FormDataContext } from '../FormDataContextWrapper';

export const EditMatchForm = (props: {
  selectedMatch: MatchDataType | undefined;
  isSuccessDeleteMatch: boolean;
}) => {
  const { selectedMatch, isSuccessDeleteMatch } = props;

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
  const [isTitle, setIsTitle] = useState(false);
  const { formData, setFormData } = useContext(FormDataContext);

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
  const pickModifiedData = (
    data: MatchUpdateFormType
  ): Partial<MatchUpdateFormType> => {
    //? 変更のあるデータだけを抽出
    const extractData: Partial<MatchUpdateFormType> = pickBy(
      data,
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

  const updateMatchExecute = () => {
    try {
      showModalIfNotSelectMatch();

      //? 現在のmatchデータと変更データを比較して、変更があるプロパティだけを抽出
      const modifiedData = pickModifiedData(formData);

      showModalIfDataNotChanged(modifiedData);

      const matchId = selectedMatch!.id;

      updateMatch({ matchId, changeData: modifiedData });
    } catch (error: unknown) {
      //?MessageTypeには空文字も含まれている
      const e = error as Error;
      if (isMessageType(e.message) && e.message) {
        showToastModalMessage({
          message: e.message,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Has error when match update', error);
      }
    }
  };

  return (
    <MatchSetFormContainer onSubmit={updateMatchExecute} title={isTitle} />
  );
};
