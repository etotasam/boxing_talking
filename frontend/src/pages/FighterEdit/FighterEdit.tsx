import React, { useEffect, useState } from "react";
import { isEqual } from "lodash";
import { queryKeys } from "@/libs/queryKeys";
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";
//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import {
  useFetchFighters,
  useUpdateFighter,
  useDeleteFighter,
  limit,
  FighterType,
} from "@/libs/hooks/useFighter";
//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";
//! component
import { Fighter } from "@/components/module/Fighter";
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { Spinner } from "@/components/module/Spinner";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { PendingModal } from "@/components/modal/PendingModal";
import { ConfirmModal } from "@/components/modal/ConfirmModal";
import { FighterSearchForm } from "@/components/module/FighterSearchForm";
//! data for test
export let _selectFighter: FighterType | undefined;

export const FighterEdit = () => {
  //? paramsの取得
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const paramPage = Number(query.get("page"));
  const paramName = query.get("name");
  const paramCountry = query.get("country");
  const navigate = useNavigate();
  if (!paramPage) {
    navigate("/fighter/edit?page=1");
  }

  type SubjectType = {
    name: string;
    country: string;
  };

  //? Link先の作成
  const searchSub = { name: paramName, country: paramCountry };
  const params = (Object.keys(searchSub) as Array<keyof SubjectType>).reduce((acc, key) => {
    if (searchSub[key]) {
      return acc + `&${key}=${searchSub[key]}`;
    }
    return acc;
  }, "");

  //? ReactQueryでFighterEditFormとデータを共有
  const { state: fighterEditData, setter: setFighterEditData } = useQueryState<FighterType>(
    queryKeys.fighterEditData,
    initialFighterInfoState
  );
  //? testで使う為の変数
  _selectFighter = fighterEditData;
  //? unMount時にfighterEditDataを初期化
  useEffect(() => {
    return () => {
      setFighterEditData(initialFighterInfoState);
    };
  }, []);

  const { setToastModalMessage, clearToastModaleMessage } = useToastModal();

  //? 選手データの取得(react query)
  const {
    data: fetchFightersData,
    count: fightersCount,
    isError: isErrorFetchFighters,
    isLoading: isLoadingFetchFighters,
    isPreviousData,
  } = useFetchFighters();

  //? 選手データの更新のフック
  const { updateFighter, isLoading: isUpdatingFighter } = useUpdateFighter();

  //? 選手を選択しているかどうか
  const inputEl = document.getElementsByName("fighter") as NodeListOf<HTMLInputElement>;
  const isChecked = Array.from(inputEl)
    .map((e) => e.checked)
    .includes(true);
  //? 対象の選手を選択しているかどうかをreact queryで共有
  const { state: isSelectedFighter, setter: setIsSelectedFighter } = useQueryState<boolean>(
    queryKeys.isSelectedFighter,
    isChecked
  );
  useEffect(() => {
    setIsSelectedFighter(isChecked);
  }, [isChecked]);

  //? 削除確認のモーダル visible/invisible
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearToastModaleMessage();
    if (isSelectedFighter) {
      setOpenConfirmModal(true);
    } else {
      setToastModalMessage({
        message: MESSAGE.NO_SELECT_EDIT_FIGHTER,
        bgColor: ModalBgColorType.NOTICE,
      });
    }
  };

  //? 選手データの削除
  const { deleteFighter, isLoading: isDeletingFighter } = useDeleteFighter();
  const fighterDelete = async () => {
    setOpenConfirmModal(false);
    deleteFighter(fighterEditData!);
  };

  const getFighterWithId = (fighterId: number) => {
    if (!fetchFightersData) return;
    return fetchFightersData.find((fighter) => fighter.id === fighterId);
  };

  const tryFighterEdit = async () => {
    if (!fighterEditData) return;
    clearToastModaleMessage();
    //? 選手を選択していない場合return
    if (!isSelectedFighter) {
      setToastModalMessage({
        message: MESSAGE.NO_SELECT_EDIT_FIGHTER,
        bgColor: ModalBgColorType.NOTICE,
      });
      return;
    }
    //? 選手dataを編集していない場合return
    if (isEqual(getFighterWithId(fighterEditData.id), fighterEditData)) {
      setToastModalMessage({ message: MESSAGE.NOT_EDIT_FIGHTER, bgColor: ModalBgColorType.NULL });
      return;
    }
    //? 選手データ編集実行
    updateFighter(fighterEditData);
  };

  //? page数の計算
  const [pageCountArray, setPageCountArray] = useState<number[]>([]);
  useEffect(() => {
    if (fightersCount === undefined) return;
    const pagesCount = Math.ceil(fightersCount / limit);
    const pagesLength = [...Array(pagesCount + 1)].map((_, num) => num).filter((n) => n >= 1);
    setPageCountArray(pagesLength);
  }, [fightersCount]);

  //? spinnerを出す条件
  const conditionVisibleSpinner = (fighter: FighterType) => {
    if (!fighterEditData) return;
    const isLoading =
      (isDeletingFighter && fighterEditData.id === fighter.id) ||
      (isUpdatingFighter && fighterEditData.id === fighter.id) ||
      !fighter.id;
    return isLoading;
  };

  const actionBtns = [{ btnTitle: "選手の削除", form: "fighter-edit" }];

  //todo エラー時の画面を表示しよう(未作成)
  if (isErrorFetchFighters) return <p>error</p>;
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px] w-full">
        <div className="w-2/3">
          <Paginate pageCountArray={pageCountArray} params={params} currentPage={paramPage} />
          <form id="fighter-edit" className="relative" onSubmit={onSubmit}>
            {fetchFightersData &&
              fetchFightersData.map((fighter) => (
                <div key={fighter.id} className={`relative bg-stone-200 m-2`}>
                  <input
                    className="absolute top-[50%] left-5 translate-y-[-50%] cursor-pointer"
                    id={`${fighter.id}_${fighter.name}`}
                    type="radio"
                    name="fighter"
                    onChange={() => setFighterEditData(fighter)}
                    data-testid={`input-${fighter.id}`}
                  />
                  <label
                    className={"w-[90%] cursor-pointer"}
                    htmlFor={`${fighter.id}_${fighter.name}`}
                  >
                    <Fighter fighter={fighter} />
                  </label>
                  {conditionVisibleSpinner(fighter) && <Spinner className="" />}
                </div>
              ))}
            {isPreviousData && <PendingModal message="選手データ取得中..." />}
          </form>
        </div>
        <div className="w-1/3">
          <div className="sticky top-[100px] right-0">
            <FighterEditForm
              className="flex justify-center w-full"
              onSubmit={tryFighterEdit}
              isPending={isUpdatingFighter}
              fighterData={fighterEditData}
            />
            <FighterSearchForm className="bg-stone-200 w-full mt-5" />
          </div>
        </div>
      </div>
      {isLoadingFetchFighters && <PendingModal />}
      {openConfirmModal && (
        <ConfirmModal
          execution={fighterDelete}
          message={`${fighterEditData!.name}を削除しますか？`}
          okBtnString="削除"
          cancel={() => setOpenConfirmModal(false)}
        />
      )}
    </LayoutForEditPage>
  );
};

type PaginatePropsType = {
  pageCountArray: number[];
  params: string;
  currentPage: number;
};

const Paginate = ({ pageCountArray, params, currentPage }: PaginatePropsType) => {
  return (
    <div className="sticky top-[100px] w-full z-50 bg-black/50 h-[35px] flex items-center justify-center">
      <div className="flex justify-center">
        {pageCountArray.length >= 2 &&
          pageCountArray.map((page) => (
            <div
              className={`ml-3 px-2 ${
                page === currentPage ? `bg-green-500 text-white` : `bg-stone-200`
              }`}
              key={page}
            >
              <Link to={`/fighter/edit?page=${page}${params}`}>{page}</Link>
            </div>
          ))}
      </div>
    </div>
  );
};
