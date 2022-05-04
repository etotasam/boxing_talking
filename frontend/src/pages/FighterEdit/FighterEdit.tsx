import React, { useState } from "react";
// import { fetchFighterAPI } from "@/libs/apis/fetchFightersAPI";
import axios, { isAxiosError } from "@/libs/axios";
import { isEqual } from "lodash";

import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

//! type
import { FighterType } from "@/libs/hooks/fetchers";

//! api
import { updateFighter } from "@/libs/apis/fighterAPI";

//! hooks
import { useFighters } from "@/libs/hooks/fetchers";
import { useMessageController } from "@/libs/hooks/messageController";

//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

//! component
import { Fighter } from "@/components/module/Fighter";
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";

//! data for test
export let _selectFighter: FighterType | undefined;

export const FighterEdit = () => {
  const [selectFighter, setSelectFighter] = useState<FighterType>();
  _selectFighter = selectFighter;

  const { setMessageToModal } = useMessageController();

  const { data: fightersData, error: fetchFightersError, mutate: fightersMutate } = useFighters();

  const [fighterDeletePending, setFighterDeletePending] = useState(false);
  const fighterDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectFighter === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_DELETE_FIGHTER, ModalBgColorType.NOTICE);
      return;
    }
    try {
      setFighterDeletePending(true);
      await axios.delete("api/fighter", { data: { fighterId: selectFighter.id } });
      setFighterDeletePending(false);
      //? 削除対象選手を抜いた選手データ
      const widthOutSelectFighterData = fightersData?.filter(
        (fighter) => fighter.id !== selectFighter.id
      );

      //? refetch
      await fightersMutate(widthOutSelectFighterData);
      setMessageToModal(MESSAGE.FIGHTER_DELETED, ModalBgColorType.SUCCESS);
    } catch (e) {
      setFighterDeletePending(false);
      setMessageToModal(MESSAGE.FAILD_FIGHTER_DELETE, ModalBgColorType.NOTICE);
      if (isAxiosError(e)) {
        if (!e.response) return;
        const { data, status } = e.response;
        console.log(data, status);
      }
    }
    // setFighterDeletePending(false);
  };

  const getFighterWithId = (fighterId: number) => {
    if (!fightersData) return;
    return fightersData.find((fighter) => fighter.id === fighterId);
  };

  const [updatePending, setUpdatePending] = useState(false);
  const tryFighterEdit = async (
    e: React.FormEvent<HTMLFormElement>,
    inputFighterInfo: FighterType
  ) => {
    e.preventDefault();
    //? 選手を選択していない場合return
    if (selectFighter === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_EDIT_FIGHTER, ModalBgColorType.NOTICE);
      return;
    }
    //? 選手dataを編集していない場合return
    if (isEqual(getFighterWithId(inputFighterInfo.id), inputFighterInfo)) {
      setMessageToModal(MESSAGE.NOT_EDIT_FIGHTER, ModalBgColorType.NOTICE);
      return;
    }
    setUpdatePending(true);
    try {
      //? 選手データの更新
      await updateFighter({ inputFighterInfo });
      //? 選手データを更新(frontend側)
      const updateFightersData = fightersData?.reduce((acc: FighterType[], curr: FighterType) => {
        if (curr.id === inputFighterInfo.id) {
          return [...acc, inputFighterInfo];
        }
        return [...acc, curr];
      }, []);
      //? refetch
      fightersMutate(updateFightersData);
      setMessageToModal(MESSAGE.FIGHTER_EDIT_SUCCESS, ModalBgColorType.SUCCESS);
    } catch (error) {
      setMessageToModal(MESSAGE.COMMENT_DELETE_FAILED, ModalBgColorType.ERROR);
      console.log("エラーです");
    }
    setUpdatePending(false);
  };

  const actionBtns = [{ btnTitle: "選手の削除", form: "fighter-edit" }];

  //todo エラー時の画面を表示しよう(未作成)
  if (fetchFightersError) return <p>error</p>;
  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px]">
        <form id="fighter-edit" className="w-2/3 relative" onSubmit={fighterDelete}>
          {fightersData &&
            fightersData.map((fighter) => (
              <div key={fighter.id} className={`relative bg-stone-200 m-2`}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%]"
                  id={`${fighter.id}_${fighter.name}`}
                  type="radio"
                  name="fighter"
                  onChange={() => setSelectFighter(fighter)}
                  data-testid={`input-${fighter.id}`}
                />
                <label
                  className={"w-[90%] cursor-pointer"}
                  htmlFor={`${fighter.id}_${fighter.name}`}
                >
                  <Fighter fighter={fighter} />
                </label>
              </div>
            ))}
          {updatePending && <SpinnerModal className="" />}
        </form>
        <div className="w-1/3">
          <FighterEditForm
            className="sticky top-[110px] left-0 flex justify-center w-[90%]"
            onSubmit={(event, inputFighterInfo) => tryFighterEdit(event, inputFighterInfo)}
            fighterInfo={selectFighter}
          />
        </div>
      </div>
      {(!fightersData || fighterDeletePending) && <FullScreenSpinnerModal />}
    </LayoutForEditPage>
  );
};
