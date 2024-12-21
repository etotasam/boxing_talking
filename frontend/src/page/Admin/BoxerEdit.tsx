import React, { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { Helmet } from 'react-helmet-async';
//! layout wrapper
import AdminOnlyLayout from '@/layout/AdminOnlyLayout';
//! data
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/assets/boxerData';

//! recoil
import { useRecoilValue, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boxerDataOnFormState } from '@/store/boxerDataOnFormState';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import { useFetchBoxers, useUpdateBoxerData, useDeleteBoxer } from '@/hooks/apiHooks/useBoxer';
//! types
import { BoxerType, MessageType } from '@/assets/types';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';
import { Button } from '@/components/atomic/Button';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerEdit = () => {
  // ? use hook
  const { resetLoadingState } = useLoading();
  const { hideToastModal, showToastModalMessage } = useToastModal();
  const [editTargetBoxerData, setEditTargetBoxerData] = useRecoilState(boxerDataOnFormState);
  const { updateBoxer } = useUpdateBoxerData();
  const { deleteBoxer, isSuccess: isDeleteBoxerSuccess } = useDeleteBoxer();
  const { boxersData } = useFetchBoxers();
  //? 選択したボクサーのidが入る(選手が選択されているかの判断に使用)
  const [selectBoxerNumber, setIsSelectBoxerNumber] = useState<number>();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    return () => {
      resetLoadingState();
    };
  }, []);

  //? boxerの削除に成功したらformデータを初期化
  useEffect(() => {
    if (isDeleteBoxerSuccess) {
      setEditTargetBoxerData(initialBoxerDataOnForm);
      setIsSelectBoxerNumber(undefined);
    }
  }, [isDeleteBoxerSuccess]);

  // ? アンマウント時にはトーストモーダルを隠す
  //? form内データをデフォルトに戻す
  useEffect(() => {
    return () => {
      hideToastModal();
      setEditTargetBoxerData(initialBoxerDataOnForm);
    };
  }, []);

  //? errorToastをMessageを受け取って表示させる
  const showErrorToastWithMessage = (errorMessage: MessageType) => {
    showToastModalMessage({
      message: errorMessage,
      bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
    });
  };

  // ? 選手が選択されていない時
  const showErrorToastWhenNoSelectedBoxer = () => {
    if (!selectBoxerNumber) {
      showErrorToastWithMessage(MESSAGE.BOXER_NO_SELECTED);
      return;
    }
  };
  //? 選手名が空の時
  const showErrorToastWhenEmptyBoxerName = () => {
    if (!editTargetBoxerData.name || !editTargetBoxerData.engName) {
      showErrorToastWithMessage(MESSAGE.BOXER_NAME_UNDEFINED);
      return;
    }
  };

  //? 国籍が未選択
  const showErrorToastWhenNoSelectedCountry = () => {
    if (!editTargetBoxerData.country) {
      showErrorToastWithMessage(MESSAGE.BOXER_COUNTRY_IS_REQUIRED);
      return;
    }
  };

  //? update対象のboxerデータを取得
  const extractBoxer = ({
    targetBoxerId,
    boxers,
  }: {
    targetBoxerId: number;
    boxers: BoxerType[];
  }): BoxerType | undefined => {
    return boxers.find((boxer) => boxer.id === targetBoxerId);
  };

  //? 対象boxerデータに変更がない場合エラーモーダル表示
  const checkFighterDataUpdate = ({
    targetBoxerData,
    message,
  }: {
    targetBoxerData: BoxerType | undefined;
    message: MessageType;
  }) => {
    const isDataEqual = isEqual(targetBoxerData, editTargetBoxerData);
    if (isDataEqual) {
      showErrorToastWithMessage(message);
      return isDataEqual;
    }
  };

  //? boxerの変更があるデータだけを抽出
  const extractChangeData = (boxer: BoxerType): Pick<BoxerType, 'id'> & Partial<BoxerType> => {
    const changeData = (Object.keys(editTargetBoxerData) as Array<keyof BoxerType>).reduce(
      (accumulator, key) => {
        if (key === 'id') {
          return { ...accumulator, id: editTargetBoxerData.id };
        }
        if (!isEqual(editTargetBoxerData[key], boxer![key])) {
          return { ...accumulator, [key]: editTargetBoxerData[key] };
        } else {
          return { ...accumulator };
        }
      },
      {}
    ) as Pick<BoxerType, 'id'> & Partial<BoxerType>;

    return changeData;
  };

  //? ボクサーの編集を実行
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!boxersData) return console.error('No have boxers data');
    //入力エラーがある時に処理終了とエラーメッセージ表示
    showErrorToastWhenNoSelectedBoxer();
    showErrorToastWhenEmptyBoxerName();
    showErrorToastWhenNoSelectedCountry();

    //編集対象ターゲットのデータ(変更前のデータ)
    const targetBoxerCurrentData = extractBoxer({
      targetBoxerId: editTargetBoxerData.id,
      boxers: boxersData,
    });

    if (!targetBoxerCurrentData) return;

    //対象ボクサーデータに変更がない場合はメッセージを表示
    const isNotChangeFighterData = checkFighterDataUpdate({
      targetBoxerData: targetBoxerCurrentData,
      message: MESSAGE.BOXER_NOT_EDIT,
    });
    if (isNotChangeFighterData) return;

    const updateBoxerData = extractChangeData(targetBoxerCurrentData);
    //ボクサーデータ編集実行
    updateBoxer(updateBoxerData);
  };

  const [isShowDeleteConfirmModal, setIsShowDeleteConfirmModal] = useState(false);

  const hideDeleteConformModal = () => {
    setIsShowDeleteConfirmModal(false);
  };

  //?削除データの実行
  const deleteExecution = () => {
    hideDeleteConformModal();

    showErrorToastWhenNoSelectedBoxer();

    deleteBoxer(editTargetBoxerData);
  };

  return (
    <AdminOnlyLayout>
      <Helmet>
        <title>Boxer編集 | {siteTitle}</title>
      </Helmet>
      <div className="w-full flex">
        <BoxerInfoAndEditBox
          editTargetBoxerData={editTargetBoxerData}
          selectBoxerNumber={selectBoxerNumber}
          onSubmit={onSubmit}
          setIsShowDeleteConfirmModal={setIsShowDeleteConfirmModal}
        />

        <BoxerList
          selectBoxerNumber={selectBoxerNumber}
          setIsSelectBoxerNumber={setIsSelectBoxerNumber}
          setEditTargetBoxerData={setEditTargetBoxerData}
        />
      </div>

      {/* //? ボクサー削除モーダル */}
      {isShowDeleteConfirmModal && (
        <BoxerDeleteConfirmModal
          targetName={editTargetBoxerData.name}
          execution={deleteExecution}
          cancel={hideDeleteConformModal}
        />
      )}
    </AdminOnlyLayout>
  );
};

type BoxerListType = {
  selectBoxerNumber: number | undefined;
  setIsSelectBoxerNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
  setEditTargetBoxerData: (boxer: BoxerType) => void;
};
const BoxerList = (props: BoxerListType) => {
  const { selectBoxerNumber, setIsSelectBoxerNumber, setEditTargetBoxerData } = props;
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
        setEditTargetBoxerData={setEditTargetBoxerData}
      />
    </section>
  );
};

type BoxerInfoAndEditBoxType = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  editTargetBoxerData: BoxerType;
  selectBoxerNumber: number | undefined;
  setIsShowDeleteConfirmModal: React.Dispatch<React.SetStateAction<boolean>>;
};
const BoxerInfoAndEditBox = (props: BoxerInfoAndEditBoxType) => {
  const { onSubmit, editTargetBoxerData, selectBoxerNumber, setIsShowDeleteConfirmModal } = props;
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  const { setToastModal, showToastModal } = useToastModal();
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
            <BoxerEditForm editTargetBoxerData={editTargetBoxerData} onSubmit={onSubmit} />
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
                    setToastModal({
                      message: MESSAGE.BOXER_NO_SELECTED,
                      bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
                    });
                    showToastModal();
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
  setEditTargetBoxerData: (boxer: BoxerType) => void;
  selectBoxerNumber: number | undefined;
  setIsSelectBoxerNumber: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const BoxersList = ({
  selectBoxerNumber,
  setIsSelectBoxerNumber,
  boxersData,
  setEditTargetBoxerData,
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
                  setEditTargetBoxerData(boxer);
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
