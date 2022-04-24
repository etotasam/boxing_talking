import React, { useState } from "react";
// import { fetchFighterAPI } from "@/libs/apis/fetchFightersAPI";
import { FighterType } from "@/libs/types/fighter";
import axios, { isAxiosError } from "@/libs/axios";
import { isEqual } from "lodash";

import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

//! api
import { updateFighter } from "@/libs/apis/fighterAPI";

//! hooks
import { useFetchFighters } from "@/libs/hooks/useFetchFighters";
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
export let _fighterInfo: FighterType | undefined;

export const FighterEdit = () => {
  const [fighterInfo, setFighterInfo] = useState<FighterType>();
  _fighterInfo = fighterInfo;

  const { setMessageToModal } = useMessageController();

  const { fetchAllFighters, fightersState, cancel: cancelFetchFighters } = useFetchFighters();

  const [fighterDeletePending, setFighterDeletePending] = useState(false);
  const fighterDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (fighterInfo === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_DELETE_FIGHTER, ModalBgColorType.NOTICE);
      return;
    }
    setFighterDeletePending(true);
    try {
      await axios.delete("api/fighter", { data: { fighterId: fighterInfo.id } });
      await fetchAllFighters();
      setMessageToModal(MESSAGE.FIGHTER_DELETED, ModalBgColorType.SUCCESS);
    } catch (e) {
      setMessageToModal(MESSAGE.FAILD_FIGHTER_DELETE, ModalBgColorType.NOTICE);
      if (isAxiosError(e)) {
        if (!e.response) return;
        const { data, status } = e.response;
        console.log(data, status);
      }
    }
    setFighterDeletePending(false);
  };

  const getFighterWithId = (fighterId: number) => {
    if (!fightersState.fighters) return;
    return fightersState.fighters.find((fighter) => fighter.id === fighterId);
  };

  const [updatePending, setUpdatePending] = useState(false);
  const tryFighterEdit = async (e: React.FormEvent<HTMLFormElement>, inputFighterInfo: FighterType) => {
    e.preventDefault();
    //? 選手を選択していない場合return
    if (fighterInfo === undefined) {
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
      const responseUpdate = await updateFighter({ inputFighterInfo });
      await fetchAllFighters();
      console.log(responseUpdate);
    } catch (error) {
      console.log("エラーです");
    }
    setUpdatePending(false);
  };

  React.useEffect(() => {
    if (fightersState.fighters !== undefined) return;
    (async () => {
      await fetchAllFighters();
    })();
    return () => {
      cancelFetchFighters();
    };
  }, []);

  const actionBtns = [{ btnTitle: "選手の削除", form: "fighter-edit" }];

  return (
    <LayoutForEditPage>
      <EditActionBtns actionBtns={actionBtns} />
      <div className="flex mt-[50px]">
        <form id="fighter-edit" className="w-2/3 relative" onSubmit={fighterDelete}>
          {fightersState.fighters &&
            fightersState.fighters.map((fighter) => (
              <div key={fighter.id} className={`relative bg-stone-200 m-2`}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%]"
                  id={`${fighter.id}_${fighter.name}`}
                  type="radio"
                  name="fighter"
                  onChange={() => setFighterInfo(fighter)}
                  data-testid={`input-${fighter.id}`}
                />
                <label className={"w-[90%] cursor-pointer"} htmlFor={`${fighter.id}_${fighter.name}`}>
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
            fighterInfo={fighterInfo}
          />
        </div>
      </div>
      {fighterDeletePending && <FullScreenSpinnerModal />}
    </LayoutForEditPage>
  );
};
