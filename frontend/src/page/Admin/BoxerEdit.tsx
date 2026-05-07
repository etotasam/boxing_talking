import React, { useEffect, useState } from 'react';
import { isEqual, pickBy } from 'lodash';
import { Helmet } from 'react-helmet-async';
//! data
import { MESSAGE } from '@/constants/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/constants/boxerData';

//! recoil
import { useRecoilValue, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boxerCurrentState } from '@/store/boxerCurrentState';
//! hooks
import { useBoxerFieldData } from '@/hooks/useBoxerFieldData';
import { useToastModal } from '@/hooks/useToastModal';
import { useFetchBoxers, useUpdateBoxerData, useDeleteBoxer } from '@/hooks/apiHooks/boxer';
//! types
import { BoxerType } from '@/types';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { Button } from '@/components/atomic/Button';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export type LocalDataEntryType = <k extends keyof BoxerType>(
  boxerDataKey: k,
  value: BoxerType[k]
) => void;

export const BoxerEdit = () => {
  // ? use hook
  const { hideToastModal, showErrorToast, showNoticeToast } = useToastModal();
  const [boxerCurrentData, setBoxerCurrentData] = useRecoilState(boxerCurrentState);
  const { updateBoxer, isSuccess: updateBoxerSuccess } = useUpdateBoxerData();
  const { deleteBoxer, isSuccess: isDeleteBoxerSuccess } = useDeleteBoxer();
  const { boxersData } = useFetchBoxers();
  const { setBoxerFieldData } = useBoxerFieldData();
  //? 選択したボクサーのidが入る(選手が選択されているかの判断に使用)
  const [selectBoxerNumber, setIsSelectBoxerNumber] = useState<number>();

  //? 初期設定(クリーンアップとか)
  // useEffect(() => {
  //   return () => {
  //     resetLoadingState();
  //   };
  // }, []);

  //? boxerの削除に成功したらformデータを初期化
  useEffect(() => {
    if (isDeleteBoxerSuccess) {
      setBoxerCurrentData(initialBoxerDataOnForm);
      setIsSelectBoxerNumber(undefined);
    }
  }, [isDeleteBoxerSuccess]);

  // ? アンマウント時にはトーストモーダルを隠す
  //? form内データをデフォルトに戻す
  useEffect(() => {
    return () => {
      hideToastModal();
      setBoxerCurrentData(initialBoxerDataOnForm);
    };
  }, []);

  //? update対象のboxerデータを取得
  const extractTargetBoxer = (targetBoxerId: number): BoxerType | undefined => {
    if (boxersData) {
      return boxersData.find((boxer) => boxer.id === targetBoxerId);
    } else {
      console.error('No have boxers data');
      return;
    }
  };

  //? 対象boxerデータに変更があるかをチェックし、変更なしの場合エラーモーダル表示
  const checkIsBoxerDataChanged = (): boolean => {
    const originalBoxerData = extractTargetBoxer(boxerCurrentData.id!);
    const isDataChanged = !isEqual(originalBoxerData, boxerCurrentData);
    if (!isDataChanged) {
      showNoticeToast(MESSAGE.BOXER_NOT_EDIT);
      return false;
    }
    return true;
  };

  //? boxerの変更があるデータだけを抽出
  const extractChangeData = (): Pick<BoxerType, 'id'> & Partial<BoxerType> => {
    const originalBoxerData = extractTargetBoxer(boxerCurrentData.id!);
    const boxerDataForUpdate = pickBy(
      boxerCurrentData,
      (value, key) => !isEqual(value, originalBoxerData![key as keyof BoxerType])
    );
    return { id: boxerCurrentData.id, ...boxerDataForUpdate } as Pick<BoxerType, 'id'> &
      Partial<BoxerType>;
  };

  //? ボクサーの編集を実行
  const submitEditBoxerData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!boxersData) return console.error('No have boxers data');
    //入力エラーがある時に処理終了とエラーメッセージ表示
    if (!selectBoxerNumber) {
      showErrorToast(MESSAGE.BOXER_NO_SELECTED);
      return;
    }
    if (!boxerCurrentData.name || !boxerCurrentData.engName) {
      showErrorToast(MESSAGE.BOXER_NAME_UNDEFINED);
      return;
    }
    if (!boxerCurrentData.country) {
      showErrorToast(MESSAGE.BOXER_COUNTRY_IS_REQUIRED);
      return;
    }

    if (!boxerCurrentData) return;

    //対象ボクサーデータに変更があるかをチェック、変更なしの場合はメモーダルでで警告を表示
    if (!checkIsBoxerDataChanged()) return;

    const formattedBoxerDataForUpdate = extractChangeData();
    //ボクサーデータ編集実行
    updateBoxer(formattedBoxerDataForUpdate);
  };

  const [isShowDeleteConfirmModal, setIsShowDeleteConfirmModal] = useState(false);

  const hideDeleteConformModal = () => {
    setIsShowDeleteConfirmModal(false);
  };

  //?削除データの実行
  const deleteExecution = () => {
    hideDeleteConformModal();

    if (!selectBoxerNumber) {
      showErrorToast(MESSAGE.BOXER_NO_SELECTED);
      return;
    }

    deleteBoxer(boxerCurrentData);
  };

  return (
    <>
      <Helmet>
        <title>Boxer編集 | {siteTitle}</title>
      </Helmet>
      <div className="w-full flex">
        <BoxerInfoAndEditBox
          boxerCurrentData={boxerCurrentData}
          setBoxerFieldData={setBoxerFieldData}
          selectBoxerNumber={selectBoxerNumber}
          submitEditBoxerData={submitEditBoxerData}
          updateBoxerSuccess={updateBoxerSuccess}
          setIsShowDeleteConfirmModal={setIsShowDeleteConfirmModal}
        />

        <BoxerList
          selectBoxerNumber={selectBoxerNumber}
          setIsSelectBoxerNumber={setIsSelectBoxerNumber}
          setBoxerCurrentData={setBoxerCurrentData}
        />
      </div>

      {/* //? ボクサー削除モーダル */}
      {isShowDeleteConfirmModal && (
        <BoxerDeleteConfirmModal
          targetName={boxerCurrentData.name}
          execution={deleteExecution}
          cancel={hideDeleteConformModal}
        />
      )}
    </>
  );
};

type BoxerListType = {
  selectBoxerNumber: number | undefined;
  setIsSelectBoxerNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
  setBoxerCurrentData: (boxer: BoxerType) => void;
};
const BoxerList = (props: BoxerListType) => {
  const { selectBoxerNumber, setIsSelectBoxerNumber, setBoxerCurrentData } = props;
  const { boxersData, pageCount } = useFetchBoxers();

  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <section
      style={{
        position: 'sticky',
        top: `${headerHeight}px`,
        left: 0,
        maxHeight: `calc( 100vh - ${headerHeight}px)`,
      }}
      className="w-[30%] min-w-[300px] pb-5 overflow-auto"
    >
      <PaginationBoxerList pageCount={pageCount} />
      <BoxersList
        selectBoxerNumber={selectBoxerNumber}
        setIsSelectBoxerNumber={setIsSelectBoxerNumber}
        boxersData={boxersData}
        setBoxerCurrentData={setBoxerCurrentData}
      />
    </section>
  );
};

type BoxerInfoAndEditBoxType = {
  submitEditBoxerData: (e: React.FormEvent<HTMLFormElement>) => void;
  boxerCurrentData: BoxerType;
  setBoxerFieldData: LocalDataEntryType;
  selectBoxerNumber: number | undefined;
  updateBoxerSuccess: boolean;
  setIsShowDeleteConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
};
const BoxerInfoAndEditBox = (props: BoxerInfoAndEditBoxType) => {
  const {
    submitEditBoxerData,
    boxerCurrentData,
    selectBoxerNumber,
    setIsShowDeleteConfirmModal,
    setBoxerFieldData,
  } = props;
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  const { showErrorToast } = useToastModal();
  return (
    <section
      className="w-[70%] border-r-[1px] border-stone-200 overflow-auto"
      style={{
        height: `calc(100vh - ${headerHeight}px)`,
      }}
    >
      <div className="flex sticky top-[30px]">
        {/* //? edit  */}
        <div className="w-[50%] flex justify-center">
          <div className="w-[95%] border-[1px]">
            <BoxerEditForm
              boxerCurrentData={boxerCurrentData}
              setBoxerFieldData={setBoxerFieldData}
              submitBoxerData={submitEditBoxerData}
              isSuccess={props.updateBoxerSuccess}
            />
          </div>
        </div>
        {/* //? search */}
        <div className="w-[50%] flex justify-center">
          <div className="w-[95%]">
            <SearchBoxer />
            {/* //? delete */}
            <div className="mt-10">
              <Button
                styleName="delete"
                onClick={() => {
                  if (!selectBoxerNumber) {
                    showErrorToast(MESSAGE.BOXER_NO_SELECTED);
                    return;
                  }
                  setIsShowDeleteConfirmModal(true);
                }}
                // className="bg-red-600 text-white rounded py-2 px-10"
              >
                削除
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

type BoxerListPropsType = {
  boxersData: BoxerType[] | undefined;
  setBoxerCurrentData: (boxer: BoxerType) => void;
  selectBoxerNumber: number | undefined;
  setIsSelectBoxerNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const BoxersList = ({
  selectBoxerNumber,
  setIsSelectBoxerNumber,
  boxersData,
  setBoxerCurrentData,
}: BoxerListPropsType) => {
  //? page数の計算
  return (
    <>
      {boxersData && (
        <ul className="flex justify-center flex-col items-center">
          {boxersData.map((boxer) => (
            <div className="w-[300px] relative" key={boxer.engName}>
              <input
                className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                id={`${boxer.id}_${boxer.name}`}
                type="radio"
                name="boxer"
                checked={boxer.id === selectBoxerNumber}
                onChange={() => {
                  setIsSelectBoxerNumber(boxer.id ? boxer.id : undefined);
                  setBoxerCurrentData(boxer);
                }}
              />
              <label className={'w-[90%] cursor-pointer'} htmlFor={`${boxer.id}_${boxer.name}`}>
                <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                  <div className="text-center">
                    <EngNameWithFlag boxerCountry={boxer.country} boxerEngName={boxer.engName} />
                    <h2 className="text-lg mt-2">{boxer.name}</h2>
                  </div>
                </li>
              </label>
            </div>
          ))}
        </ul>
      )}
    </>
  );
};

type BoxerDeleteConfirmDialogPropsType = {
  execution: () => void;
  cancel: () => void;
  targetName: string;
};
const BoxerDeleteConfirmModal = ({
  execution,
  cancel,
  targetName,
}: BoxerDeleteConfirmDialogPropsType) => {
  return (
    <ConfirmDialog header={`${targetName} を削除してよろしいですか？`}>
      <div className="flex justify-between">
        <Button onClick={execution}>はい</Button>
        <Button onClick={cancel}>いいえ</Button>
      </div>
    </ConfirmDialog>
  );
};
