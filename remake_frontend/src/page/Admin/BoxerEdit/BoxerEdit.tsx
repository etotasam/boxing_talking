import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isEqual } from 'lodash';
import { Helmet } from 'react-helmet-async';
//! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from '@/assets/statusesOnToastModal';
import { initialBoxerDataOnForm } from '@/assets/boxerData';
// ! functions
import { getBoxerDataWithID, convertToBoxerData } from '@/assets/functions';
//! hooks
import { useToastModal } from '@/hooks/useToastModal';
import { usePagePath } from '@/hooks/usePagePath';
import { useLoading } from '@/hooks/useLoading';
import {
  useFetchBoxer,
  useUpdateBoxerData,
  useDeleteBoxer,
  // limit,
} from '@/hooks/useBoxer';
import { useBoxerDataOnForm } from '@/hooks/useBoxerDataOnForm';
//! types
import { BoxerType } from '@/assets/types';
//! layout
import AdminLayout from '@/layout/AdminLayout';
//! component
// import { FlagImage } from "@/components/atomic/FlagImage";
import { BoxerEditForm } from '@/components/module/BoxerEditForm';
import { SearchBoxer } from '@/components/module/SearchBoxer';
import { Confirm } from '@/components/modal/Confirm';
import { PaginationBoxerList } from '@/components/module/PaginationBoxerList';
import { EngNameWithFlag } from '@/components/atomic/EngNameWithFlag';

const siteTitle = import.meta.env.VITE_APP_SITE_TITLE;

export const BoxerEdit = () => {
  // ? use hook
  const { resetLoadingState } = useLoading();
  const { setter: setPagePath } = usePagePath();
  const { setToastModal, showToastModal, hideToastModal } = useToastModal();
  const { state: editTargetBoxerData, setter: setEditTargetBoxerData } =
    useBoxerDataOnForm();
  const { updateFighter } = useUpdateBoxerData();
  const { deleteBoxer, isSuccess: isDeleteBoxerSuccess } = useDeleteBoxer();
  const {
    boxersData,
    pageCount,
    // refetch: refetchBoxers
    // isRefetching: isRefetchingBoxerData,
  } = useFetchBoxer();
  //? 選択したボクサーのidが入る(選手が選択されているかの判断に使用)
  const [checked, setChecked] = useState<number>();
  //? paramsの取得
  const { pathname } = useLocation();
  // const query = new URLSearchParams(search);
  // const paramPage = Number(query.get("page"));
  // const paramName = query.get("name");
  // const paramCountry = query.get("country");
  // const navigate = useNavigate();

  //? 初期設定(クリーンアップとか)
  useEffect(() => {
    //? ページpathをRecoilに保存
    setPagePath(pathname);
    return () => {
      resetLoadingState();
    };
  }, []);

  //? boxerの削除に成功したらformデータを初期化
  useEffect(() => {
    if (isDeleteBoxerSuccess) {
      setEditTargetBoxerData(initialBoxerDataOnForm);
      setChecked(undefined);
    }
  }, [isDeleteBoxerSuccess]);

  // ? アンマウント時にはトーストモーダルを隠す
  useEffect(() => {
    return () => {
      hideToastModal();
    };
  }, []);

  //? 選手データの削除実行
  // const {
  //   deleteFighter,
  //   isLoading: isDeletingFighter,
  //   isSuccess: isDeleteSuccess,
  // } = useDeleteFighter();

  // const fighterDelete = async () => {
  //   setOpenConfirmModal(false);
  //   deleteFighter(editFighterData!);
  // };

  // ! ボクサーの編集を実行
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ? 選手が選択されていない
    if (!checked) {
      setToastModal({
        message: MESSAGE.BOXER_NO_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
      });
      showToastModal();
      return;
    }
    //? 名前が空
    if (!editTargetBoxerData.name || !editTargetBoxerData.eng_name) {
      setToastModal({
        message: MESSAGE.BOXER_NAME_UNDEFINED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
      });
      showToastModal();
      return;
    }
    if (!boxersData) return console.error('No have boxers data');
    //? データ変更がされていない時
    const boxer = getBoxerDataWithID({
      boxerID: editTargetBoxerData.id,
      boxersData: boxersData,
    });
    const convertedData = convertToBoxerData(editTargetBoxerData);
    if (isEqual(boxer, convertedData)) {
      setToastModal({
        message: MESSAGE.BOXER_NOT_EDIT,
        bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
      });
      showToastModal();
      return;
    }

    //? ボクサーデータ編集実行
    updateFighter(editTargetBoxerData);
  };

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const cancel = () => {
    setIsDeleteConfirm(false);
  };

  //?削除データの実行
  const execution = () => {
    setIsDeleteConfirm(false);
    if (!checked) {
      setToastModal({
        message: MESSAGE.BOXER_NO_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR,
      });
      showToastModal();
      return;
    }
    deleteBoxer(editTargetBoxerData);
    setIsDeleteConfirm(false);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Boxer編集 | {siteTitle}</title>
      </Helmet>
      <div className="w-full flex">
        <section className="w-[70%]">
          <div className="flex sticky top-[calc(100px+30px)] mt-[30px]">
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
                      if (!checked) {
                        setToastModal({
                          message: MESSAGE.BOXER_NO_SELECTED,
                          bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
                        });
                        showToastModal();
                        return;
                      }
                      setIsDeleteConfirm(true);
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
        <section className="w-[30%] min-w-[300px] border-l-[1px] border-stone-200 mb-5">
          <PaginationBoxerList pageCount={pageCount} />
          <BoxersList
            checked={checked}
            setChecked={setChecked}
            boxersData={boxersData}
            setEditTargetBoxerData={setEditTargetBoxerData}
          />
        </section>
      </div>
      {isDeleteConfirm && (
        <Confirm execution={execution} cancel={cancel}>
          削除しますか？
        </Confirm>
      )}
    </AdminLayout>
  );
};

type BoxerListPropsType = {
  boxersData: BoxerType[] | undefined;
  setEditTargetBoxerData: (boxer: BoxerType) => void;
  checked: number | undefined;
  setChecked: React.Dispatch<React.SetStateAction<number | undefined>>;
};

const BoxersList = ({
  checked,
  setChecked,
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
                checked={boxer.id === checked}
                onChange={() => {
                  setChecked(boxer.id ? boxer.id : undefined);
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
