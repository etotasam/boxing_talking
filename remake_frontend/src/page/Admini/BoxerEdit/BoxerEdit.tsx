import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
// ! data
//! data
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";
// ! functions
import { getBoxerDataWithID, convertToBoxerData } from "@/assets/functions";
//! hooks
import { useToastModal } from "@/hooks/useToastModal";
import { useFetchBoxer, useUpdateBoxerData } from "@/hooks/useBoxer";
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
//! types
import { BoxerType } from "@/assets/types";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";
import { BoxerEditForm } from "@/components/module/BoxerEditForm";
import { SearchBoxer } from "@/components/module/SearchBoxer";
import { Confirm } from "@/components/modal/Confirm";

export const BoxerEdit = () => {
  // ! use hook
  const { state: editTargetBoxerData, setter: setEditTargetBoxerData } =
    useBoxerDataOnForm();
  const { updateFighter } = useUpdateBoxerData();
  //? データ
  const { boxersData, pageCount } = useFetchBoxer();
  const [checked, setChecked] = useState<number>();

  //? paramsの取得
  const { search, pathname } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  const paramName = query.get("name");
  const paramCountry = query.get("country");
  const navigate = useNavigate();

  useEffect(() => {
    // if (!paramPage) {
    //   navigate("/admini/boxer_edit");
    // }
  }, []);

  const { setToastModal, showToastModal, hideToastModal } = useToastModal();

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
    if (!boxersData) return console.error("Not have boxers data");
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

  //? page数の計算
  const [pageCountArray, setPageCountArray] = useState<number[]>([]);
  // useEffect(() => {
  //   if (fightersCount === undefined) return;
  //   const pagesCount = Math.ceil(fightersCount / limit);
  //   const pagesLength = [...Array(pagesCount + 1)]
  //     .map((_, num) => num)
  //     .filter((n) => n >= 1);
  //   setPageCountArray(pagesLength);
  // }, [fightersCount]);

  //? spinnerを出す条件
  // const conditionVisibleSpinner = (boxer: BoxerType) => {
  //   if (!editFighterData) return;
  //   const isLoading =
  //     (isDeletingFighter && editFighterData.id === fighter.id) ||
  //     (isUpdatingFighter && editFighterData.id === fighter.id) ||
  //     !fighter.id;
  //   return isLoading;
  // };

  const [isDeleteConfirmm, setIsDeleteConfirm] = useState(false);

  const cancel = () => {
    setIsDeleteConfirm(false);
  };

  const execution = () => {
    console.log("実行");
    setIsDeleteConfirm(false);
  };

  return (
    <AdminiLayout>
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
                    onClick={() => setIsDeleteConfirm(true)}
                    className="bg-red-600 text-white rounded py-2 px-10"
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-[30%] min-w-[300px] border-l-[1px] border-stone-200 flex justify-center">
          <BoxersList
            checked={checked}
            setChecked={setChecked}
            boxersData={boxersData}
            setEditTargetBoxerData={setEditTargetBoxerData}
          />
        </section>
      </div>
      {isDeleteConfirmm && (
        <Confirm execution={execution} cancel={cancel}>
          削除しますか？
        </Confirm>
      )}
    </AdminiLayout>
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
  return (
    <>
      {boxersData && (
        <ul className="my-5">
          {boxersData.map((boxer) => (
            <div className="relative" key={boxer.eng_name}>
              <input
                className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                id={`${boxer.id}_${boxer.name}`}
                type="radio"
                name="boxer"
                checked={boxer.id === checked}
                onChange={(e) => {
                  setChecked(boxer.id ? boxer.id : undefined);
                  setEditTargetBoxerData(boxer);
                }}
                data-testid={`input-${boxer.id}`}
              />
              <label
                className={"w-[90%] cursor-pointer"}
                htmlFor={`${boxer.id}_${boxer.name}`}
              >
                <li className="w-[300px] mt-3 border-[1px] border-stone-300 rounded-md p-3">
                  <div className="text-center">
                    <p className="">{boxer.eng_name}</p>
                    <h2 className="relative inline-block">
                      {boxer.name}
                      <FlagImage
                        nationaly={boxer.country}
                        className="absolute top-0 right-[-45px]"
                      />
                    </h2>
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
