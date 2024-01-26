import React, { useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { Helmet } from 'react-helmet-async';
//! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/assets/boxerData';
// ! functions
import { extractBoxer } from '@/assets/functions';
//! recoil
import { useRecoilValue, useRecoilState } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { boxerDataOnFormState } from '@/store/boxerDataOnFormState';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { useLoading } from '@/hooks/useLoading';
import {
  useFetchBoxers,
  useUpdateBoxerData,
  useDeleteBoxer,
} from '@/hooks/apiHooks/useBoxer';
//! types
import { BoxerType } from '@/assets/types';
//! type evolution
import { isMessageType } from '@/assets/typeEvaluations';
//! component
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerEdit = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  // ? use hook
  const { resetLoadingState } = useLoading();
  const {
    setToastModal,
    showToastModal,
    hideToastModal,
    showToastModalMessage,
  } = useToastModal();
  const [editTargetBoxerData, setEditTargetBoxerData] =
    useRecoilState(boxerDataOnFormState);
  const { updateBoxer } = useUpdateBoxerData();
  const { deleteBoxer, isSuccess: isDeleteBoxerSuccess } = useDeleteBoxer();
  const { boxersData, pageCount } = useFetchBoxers();
  //? 選択したボクサーのidが入る(選手が選択されているかの判断に使用)
  const [isSelectBoxer, setIsSelectBoxer] = useState<number>();

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
      setIsSelectBoxer(undefined);
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

  // ? 選手が選択されていない時
  const showModalIfBoxerNotSelected = () => {
    if (!isSelectBoxer) {
      throw new Error(MESSAGE.BOXER_NO_SELECTED);
    }
  };

  //? 名前が空の時
  const showModalWhenUndefinedItem = () => {
    if (!editTargetBoxerData.name || !editTargetBoxerData.eng_name) {
      throw new Error(MESSAGE.BOXER_NAME_UNDEFINED);
    }

    if (!editTargetBoxerData.country) {
      throw new Error(MESSAGE.BOXER_COUNTRY_IS_REQUIRED);
    }
  };

  //? データ変更がある項目だけを抽出 and 変更がない時はモーダル表示
  const extractUpdateDataOrShowModalWhenNotUpdateData = () => {
    if (!boxersData) return console.error('No have boxers data');

    const boxer = extractBoxer({
      targetBoxerId: editTargetBoxerData.id,
      boxers: boxersData,
    });
    if (isEqual(boxer, editTargetBoxerData)) {
      throw new Error(MESSAGE.BOXER_NOT_EDIT);
    }

    const updateBoxerData: Partial<BoxerType> = (
      Object.keys(editTargetBoxerData) as Array<keyof BoxerType>
    ).reduce((accum, key) => {
      if (key === 'id') {
        return { ...accum, id: editTargetBoxerData.id };
      }
      if (!isEqual(editTargetBoxerData[key], boxer![key])) {
        return { ...accum, [key]: editTargetBoxerData[key] };
      } else {
        return { ...accum };
      }
    }, {});

    return updateBoxerData;
  };

  // ! ボクサーの編集を実行
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      showModalIfBoxerNotSelected();
      showModalWhenUndefinedItem();
      const updateData =
        extractUpdateDataOrShowModalWhenNotUpdateData() as Pick<
          BoxerType,
          'id'
        > &
          Partial<BoxerType>;

      //? ボクサーデータ編集実行
      updateBoxer(updateData);
    } catch (error: any) {
      if (isMessageType(error.message)) {
        showToastModalMessage({
          message: error.message,
          bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
        });
      } else {
        console.error('Failed boxer edit');
      }
    }
  };

  const [isShowDeleteConfirmDialog, setIsShowDeleteConfirmDialog] =
    useState(false);

  const hideDeleteConformModal = () => {
    setIsShowDeleteConfirmDialog(false);
  };

  //?削除データの実行
  const deleteExecution = () => {
    hideDeleteConformModal();

    showModalIfBoxerNotSelected();

    deleteBoxer(editTargetBoxerData);
    setIsShowDeleteConfirmDialog(false);
  };

  return (
    <>
      <Helmet>
        <title>Boxer編集 | {siteTitle}</title>
      </Helmet>
      <div className="w-full flex">
        <section
          className="w-[70%] border-r-[1px] border-stone-200"
          style={{
            minHeight: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          <div className="flex sticky top-[calc(100px+30px)]">
            {/* //? edit  */}
            <div className="w-[50%] flex justify-center">
              <div className="w-[95%] border-[1px]">
                <BoxerEditForm
                  editTargetBoxerData={editTargetBoxerData}
                  onSubmit={onSubmit}
                />
              </div>
            </div>
            {/* //? search */}
            <div className="w-[50%] flex justify-center">
              <div className="w-[95%]">
                <SearchBoxer />
                {/* //? delete */}
                <div className="mt-10">
                  <button
                    onClick={() => {
                      if (!isSelectBoxer) {
                        setToastModal({
                          message: MESSAGE.BOXER_NO_SELECTED,
                          bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
                        });
                        showToastModal();
                        return;
                      }
                      setIsShowDeleteConfirmDialog(true);
                    }}
                    className="bg-red-600 text-white rounded py-2 px-10"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-[30%] min-w-[300px] pb-5">
          <PaginationBoxerList pageCount={pageCount} />
          <BoxersList
            isSelectBoxer={isSelectBoxer}
            setIsSelectBoxer={setIsSelectBoxer}
            boxersData={boxersData}
            setEditTargetBoxerData={setEditTargetBoxerData}
          />
        </section>
      </div>

      {/* ボクサー削除ダイアログ */}
      {isShowDeleteConfirmDialog && (
        <BoxerDeleteConfirmDialog
          targetName={editTargetBoxerData.name}
          execution={deleteExecution}
          cancel={hideDeleteConformModal}
        />
      )}
    </>
  );
};

type BoxerListPropsType = {
  boxersData: BoxerType[] | undefined;
  setEditTargetBoxerData: (boxer: BoxerType) => void;
  isSelectBoxer: number | undefined;
  setIsSelectBoxer: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const BoxersList = ({
  isSelectBoxer,
  setIsSelectBoxer,
  boxersData,
  setEditTargetBoxerData,
}: BoxerListPropsType) => {
  //? page数の計算
  return (
    <>
      {boxersData && (
        <ul className="flex justify-center flex-col items-center">
          {boxersData.map((boxer) => (
            <div className="w-[300px] relative" key={boxer.eng_name}>
              <input
                className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                id={`${boxer.id}_${boxer.name}`}
                type="radio"
                name="boxer"
                checked={boxer.id === isSelectBoxer}
                onChange={() => {
                  setIsSelectBoxer(boxer.id ? boxer.id : undefined);
                  setEditTargetBoxerData(boxer);
                }}
              />
              <label
                className={'w-[90%] cursor-pointer'}
                htmlFor={`${boxer.id}_${boxer.name}`}
              >
                <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                  <div className="text-center">
                    <EngNameWithFlag
                      boxerCountry={boxer.country}
                      boxerEngName={boxer.eng_name}
                    />
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
const BoxerDeleteConfirmDialog = ({
  execution,
  cancel,
  targetName,
}: BoxerDeleteConfirmDialogPropsType) => {
  return (
    <ConfirmDialog header={`${targetName} を削除してよろしいですか？`}>
      <div className="flex justify-between">
        <button
          onClick={execution}
          className="bg-red-500 text-white py-1 px-5 rounded-md"
        >
          はい
        </button>
        <button
          onClick={cancel}
          className="bg-stone-500 text-white py-1 px-5 rounded-md"
        >
          いいえ
        </button>
      </div>
    </ConfirmDialog>
  );
};
