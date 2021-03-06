import React, { useEffect, useState } from "react";
// import { fetchFighterAPI } from "@/libs/apis/fetchFightersAPI";
import { Axios, isAxiosError } from "@/libs/axios";
import { isEqual } from "lodash";
import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";
import { queryKeys } from "@/libs/queryKeys";
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
//! type
import { FighterType } from "@/libs/hooks/fetchers";

//! api
import { updateFighter } from "@/libs/apis/fighterAPI";

//! hooks
// import { useFighters } from "@/libs/hooks/fetchers";
import { useMessageController } from "@/libs/hooks/messageController";
import { useQueryState } from "@/libs/hooks/useQueryState";
import {
  useFetchFighters,
  useUpdateFighter,
  useDeleteFighter,
  // useCountFighters,
  limit,
} from "@/libs/hooks/useFighter";

//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

//! component
import { Fighter } from "@/components/module/Fighter";
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { PendingModal } from "@/components/modal/PendingModal";
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
  const {
    state: fighterEidtData,
    setter: setFighterEditData,
    getLatestState: getLetestFighterDataFromForm,
  } = useQueryState<any>(queryKeys.fighterEditData, initialFighterInfoState);
  _selectFighter = fighterEidtData;

  useEffect(() => {
    return () => {
      setFighterEditData(initialFighterInfoState);
    };
  }, []);

  const { setMessageToModal } = useMessageController();

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

  //? 選手データの削除
  const { deleteFighter, isLoading: isDeletingFighter } = useDeleteFighter();
  const fighterDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSelectedFighter) {
      deleteFighter(fighterEidtData);
    } else {
      setMessageToModal(MESSAGE.NO_SELECT_EDIT_FIGHTER, ModalBgColorType.NOTICE);
    }
  };

  const getFighterWithId = (fighterId: number) => {
    if (!fetchFightersData) return;
    return fetchFightersData.find((fighter) => fighter.id === fighterId);
  };

  const tryFighterEdit = async () => {
    const latestFighterDataFromForm = getLetestFighterDataFromForm();
    //? 選手を選択していない場合return
    if (!isSelectedFighter) {
      setMessageToModal(MESSAGE.NO_SELECT_EDIT_FIGHTER, ModalBgColorType.NOTICE);
      return;
    }
    //? 選手dataを編集していない場合return
    if (isEqual(getFighterWithId(latestFighterDataFromForm.id), latestFighterDataFromForm)) {
      setMessageToModal(MESSAGE.NOT_EDIT_FIGHTER, ModalBgColorType.NULL);
      return;
    }
    //? 選手データ編集実行
    updateFighter(latestFighterDataFromForm);
  };

  //? page数の計算
  const [pageCountArray, setPageCountArray] = useState<number[]>([]);
  useEffect(() => {
    if (fightersCount === undefined) return;
    // if (fightersCount < 2) return;
    const pagesCount = Math.ceil(fightersCount / limit);
    const pagesLength = [...Array(pagesCount + 1)].map((_, num) => num).filter((n) => n >= 1);
    setPageCountArray(pagesLength);
  }, [fightersCount]);

  //? spinnerを出す条件
  const conditionVisibleSpinner = (fighter: FighterType) => {
    const isLoading =
      (isDeletingFighter && fighterEidtData.id === fighter.id) ||
      (isUpdatingFighter && fighterEidtData.id === fighter.id) ||
      !fighter.id;
    return isLoading;
  };

  const actionBtns = [{ btnTitle: "選手の削除", form: "fighter-edit" }];

  //todo エラー時の画面を表示しよう(未作成)
  if (isErrorFetchFighters) return <p>error</p>;
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px] w-[100vw]">
        <div className="w-2/3">
          <Paginate pageCountArray={pageCountArray} params={params} currentPage={paramPage} />
          <form id="fighter-edit" className="relative" onSubmit={fighterDelete}>
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
                  <label className={"w-[90%] cursor-pointer"} htmlFor={`${fighter.id}_${fighter.name}`}>
                    <Fighter fighter={fighter} />
                  </label>
                  {conditionVisibleSpinner(fighter) && <SpinnerModal className="" />}
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
              isUpdatingFighterData={isUpdatingFighter}
            />
            <FighterSearchForm className="bg-stone-200 w-full mt-5" />
          </div>
        </div>
      </div>
      {isLoadingFetchFighters && <PendingModal />}
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
    <div className="sticky top-[100px] w-full z-50 t-bgcolor-opacity-5 h-[35px] flex items-center justify-center">
      <div className="flex justify-center">
        {pageCountArray.length >= 2 &&
          pageCountArray.map((page) => (
            <div
              className={`ml-3 px-2 ${page === currentPage ? `bg-green-500 text-white` : `bg-stone-200`}`}
              key={page}
            >
              <Link to={`/fighter/edit?page=${page}${params}`}>{page}</Link>
            </div>
          ))}
      </div>
    </div>
  );
};
