import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isEqual } from "lodash";
// ! data
import { Stance, initialBoxerData } from "@/assets/boxerData";
import { QUERY_KEY } from "@/assets/queryKeys";
// ! functions
import { getBoxerDataWithID, convertToBoxerData } from "@/assets/functions";
//! hooks
import { useToastModal } from "@/hooks/useToastModal";
import { useReactQuery } from "@/hooks/useReactQuery";
import { useFetchBoxer, useUpdateBoxerData } from "@/hooks/useBoxer";
import { useBoxerDataOnForm } from "@/hooks/useBoxerDataOnForm";
import { useLoading } from "@/hooks/useLoading";

//! types
import { BoxerType } from "@/assets/types";
//! layout
import AdminiLayout from "@/layout/AdminiLayout";
//! component
import { FlagImage } from "@/components/atomc/FlagImage";
import { BoxerEditForm } from "@/components/module/BoxerEditForm";
import {
  BG_COLOR_ON_TOAST_MODAL,
  MESSAGE,
} from "@/assets/statusesOnToastModal";

export const BoxerEdit = () => {
  // ! use hook
  const { getReactQueryData, setReactQueryData } = useReactQuery();
  const { state: editTargetBoxerData, setter: setEditTargetBoxerData } =
    useBoxerDataOnForm();
  const { updateFighter } = useUpdateBoxerData();
  //? データ
  const { boxersData, pageCount, isError } = useFetchBoxer();
  const [checked, setChecked] = useState<number>();

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

  // type SubjectType = {
  //   name: string;
  //   country: string;
  // };

  //? Link先の作成
  // const searchSub = { name: paramName, country: paramCountry };
  // const params = (Object.keys(searchSub) as Array<keyof SubjectType>).reduce(
  //   (acc, key) => {
  //     if (searchSub[key]) {
  //       return acc + `&${key}=${searchSub[key]}`;
  //     }
  //     return acc;
  //   },
  //   ""
  // );

  const { setToastModal, showToastModal } = useToastModal();

  //? 選手を選択しているかどうか
  const inputEl = document.getElementsByName(
    "boxer_element"
  ) as NodeListOf<HTMLInputElement>;
  const isChecked = Array.from(inputEl)
    .map((e) => e.checked)
    .includes(true);

  //? 対象の選手を選択しているかどうかをreact queryで共有
  setReactQueryData<boolean>(QUERY_KEY.isBoxerSelected, false);
  const isSelectedFighter = getReactQueryData<boolean>(
    QUERY_KEY.isBoxerSelected
  );

  // useEffect(() => {
  //   setReactQueryData<boolean>(QUERY_KEY.isBoxerSelected, isChecked);
  // }, [isChecked]);

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
    // ? 選手が選択されていない
    if (!checked) {
      setToastModal({
        message: MESSAGE.BOXER_NO_SELECTED,
        bgColor: BG_COLOR_ON_TOAST_MODAL.GRAY,
      });
      showToastModal();
      return;
    }
    if (!editTargetBoxerData) return;
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

  // if (isErrorFetchFighters) return <p>error</p>;
  return (
    <AdminiLayout>
      <div className="w-full flex justify-center">
        <div className="flex">
          <ul>
            {Array.from({ length: pageCount }, (_, index) => (
              <Link key={index} to={`/admini/boxer_edit?page=${index + 1}`}>
                <li>{index + 1}</li>
              </Link>
            ))}
          </ul>
          <section className="w-[40%] flex justify-center items-start mb-10">
            <BoxersList
              checked={checked}
              setChecked={setChecked}
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
        <ul className="flex justify-center flex-col">
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
