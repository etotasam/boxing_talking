import React, { useEffect, useState } from "react";
import { isEqual } from "lodash";
import { Link, useLocation, useNavigate } from "react-router-dom";
// ! react query
import { useQueryClient } from "react-query";
// ! data
import { Stance, initialBoxerData } from "@/assets/boxerData";
import {
  MESSAGE,
  BG_COLOR_ON_TOAST_MODAL,
} from "@/assets/statusesOnToastModal";
import { QUERY_KEY } from "@/assets/queryKeys";
//! hooks
import { useToastModal } from "@/hooks/useToastModal";
import { useReactQuery } from "@/hooks/useReactQuery";
import { useFetchBoxer, useUpdateBoxerData } from "@/hooks/useBoxer";
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
// import { useGetWindowSize } from "@/hooks/useGetWindowSize";
// import { useQueryState } from "@/hooks/useQueryState";
//! types
import { BoxerType } from "@/assets/types";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";
import { BoxerEditForm } from "@/components/module/BoxerEditForm";

// import { Fighter } from "@/components/module/Fighter";
// import { FighterEditForm } from "@/components/module/FighterEditForm";
// import { Spinner } from "@/components/module/Spinner";
// import { EditActionBtns } from "@/components/module/EditActionBtns";
// import { PendingModal } from "@/components/modal/PendingModal";
// import { ConfirmModal } from "@/components/modal/ConfirmModal";
// import { FighterSearchForm } from "@/components/module/FighterSearchForm";
//! data for test
// export let _selectFighter: BoxerType | undefined;

export const BoxerEdit = () => {
  // ! use hook
  const { getReactQueryData, setReactQueryData } = useReactQuery();
  const { state: editTargetBoxerData, setter: setEditTargetBoxerData } =
    useBoxerDataOnForm();
  const { updateFighter } = useUpdateBoxerData();
  //? 選手データの取得(api)
  const { boxersData } = useFetchBoxer();

  //? paramsの取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  const paramName = query.get("name");
  const paramCountry = query.get("country");
  const navigate = useNavigate();

  useEffect(() => {
    if (!paramPage) {
      navigate("/admini/boxer_edit");
    }
  }, []);
  // const { width: windowWidth } = useGetWindowSize();

  type SubjectType = {
    name: string;
    country: string;
  };

  //? Link先の作成
  const searchSub = { name: paramName, country: paramCountry };
  const params = (Object.keys(searchSub) as Array<keyof SubjectType>).reduce(
    (acc, key) => {
      if (searchSub[key]) {
        return acc + `&${key}=${searchSub[key]}`;
      }
      return acc;
    },
    ""
  );

  //? fighterデータ
  const [editFighterData, setEditFighterData] =
    useState<BoxerType>(initialBoxerData);

  const { resetToastModalToDefault, setToastModal, showToastModal } =
    useToastModal();

  //? 選手データの更新のフック
  // const { updateFighter, isLoading: isUpdatingFighter } = useUpdateFighter();

  //? 選手を選択しているかどうか
  const inputEl = document.getElementsByName(
    "boxer_element"
  ) as NodeListOf<HTMLInputElement>;
  const isChecked = Array.from(inputEl)
    .map((e) => e.checked)
    .includes(true);

  //? 対象の選手を選択しているかどうかをreact queryで共有
  // const { state: isSelectedFighter, setter: setIsSelectedFighter } =
  //   useQueryState<boolean>(queryKeys.isSelectedFighter, isChecked);
  setReactQueryData<boolean>(QUERY_KEY.isBoxerSelected, false);
  const isSelectedFighter = getReactQueryData<boolean>(
    QUERY_KEY.isBoxerSelected
  );

  useEffect(() => {
    setReactQueryData<boolean>(QUERY_KEY.isBoxerSelected, isChecked);
  }, [isChecked]);

  //? 削除確認のモーダル visible/invisible
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  // const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   resetToastModalToDefault();
  //   if (isSelectedFighter) {
  //     setOpenConfirmModal(true);
  //   } else {
  //     setToastModal({
  //       message: MESSAGE.NO_SELECT_EDIT_FIGHTER,
  //       bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
  //     });
  //   }
  // };

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

  //? ボクサーデータ削除成功時にeditFighterDataを空にする
  // useEffect(() => {
  //   if (!isDeleteSuccess) return;
  //   setEditFighterData(initialBoxerData);
  // }, [isDeleteSuccess]);

  // const getFighterWithId = (fighterId: number) => {
  //   if (!fetchFightersData) return;
  //   return fetchFightersData.find((boxer) => boxer.id === fighterId);
  // };

  // todo ボクサーの編集を実行
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if (!fighterEditData) return;
    if (!editTargetBoxerData) return;
    console.log(editTargetBoxerData);
    resetToastModalToDefault();
    //? ボクサーを選択していない場合return
    // if (!isSelectedFighter) {
    //   setToastModal({
    //     message: MESSAGE.NO_SELECT_EDIT_FIGHTER,
    //     bgColor: BG_COLOR_ON_TOAST_MODAL.NOTICE,
    //   });
    //   showToastModal();
    //   return;
    // }
    //? ボクサーdataを編集していない場合return
    // if (isEqual(getFighterWithId(fighterData.id), fighterData)) {
    //   setToastModal({
    //     message: MESSAGE.NOT_EDIT_FIGHTER,
    //     bgColor: BG_COLOR_ON_TOAST_MODAL.NULL,
    //   });
    //   return;
    // }
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

  // if (isErrorFetchFighters) return <p>error</p>;
  return (
    <AdminiLayout>
      <div className="container w-screen flex justify-center">
        <div className="flex w-[95%]">
          <section className="w-[40%] flex justify-center items-start mb-10">
            <BoxersList
              boxersData={boxersData}
              setEditTargetBoxerData={setEditTargetBoxerData}
            />
          </section>
          <section className="w-[60%] flex justify-center">
            <BoxerEditForm
              editTargetBoxerData={editTargetBoxerData}
              onSubmit={onSubmit}
            />
          </section>
        </div>
      </div>
    </AdminiLayout>
  );
};

type BoxerListPropsType = {
  boxersData: BoxerType[] | undefined;
  setEditTargetBoxerData: (boxer: BoxerType) => void;
};

const BoxersList = ({
  boxersData,
  setEditTargetBoxerData,
}: BoxerListPropsType) => {
  return (
    <>
      {boxersData && (
        <ul className="flex justify-center flex-col">
          {boxersData.map((boxer) => (
            <div className="relative" key={boxer.eng_name}>
              <input
                className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                id={`${boxer.id}_${boxer.name}`}
                type="radio"
                name="boxer"
                onChange={() => setEditTargetBoxerData(boxer)}
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
