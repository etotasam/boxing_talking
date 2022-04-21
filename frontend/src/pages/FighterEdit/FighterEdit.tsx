import React from "react";
// import { fetchFighterAPI } from "@/libs/apis/fetchFightersAPI";
import { FighterType } from "@/libs/types/fighter";
import axios, { isAxiosError } from "@/libs/axios";
import { isEqual } from "lodash";

import { ModalBgColorType } from "@/store/slice/messageByPostCommentSlice";
import { MESSAGE } from "@/libs/utils";

// api
import { updateFighter } from "@/libs/apis/fighterAPI";

// hooks
import { useFetchFighters } from "@/libs/hooks/useFetchFighters";
import { useMessageController } from "@/libs/hooks/messageController";

// layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

// component
import { Fighter } from "@/components/module/Fighter";
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";

export const FighterEdit = () => {
  // const [fighters, setFighters] = React.useState<FighterType[]>();
  const [fighterInfo, setFighterInfo] = React.useState<FighterType>();
  const [selectFighterId, setSelectFighterId] = React.useState<number>();

  const { setMessageToModal } = useMessageController();

  const { fetchAllFighters, fightersState, cancel: cancelFetchFighters } = useFetchFighters();

  const [fighterDeletePending, setFighterDeletePending] = React.useState(false);
  const fighterDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectFighterId === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_DELETE_FIGHTER, ModalBgColorType.ERROR);
      return;
    }
    setFighterDeletePending(true);
    try {
      await axios.delete("api/fighter", { data: { fighterId: selectFighterId } });
      await fetchAllFighters();
      setMessageToModal(MESSAGE.FIGHTER_DELETED, ModalBgColorType.SUCCESS);
    } catch (e) {
      setMessageToModal(MESSAGE.FAILD_FIGHTER_DELETE, ModalBgColorType.ERROR);
      if (isAxiosError(e)) {
        if (!e.response) return;
        const { data, status } = e.response;
        console.log(data, status);
      }
    }
    setFighterDeletePending(false);
  };

  const [updatePending, setUpdatePending] = React.useState(false);
  const tryFighterEdit = async (e: React.FormEvent<HTMLFormElement>, inputFighterInfo: FighterType) => {
    e.preventDefault();
    if (selectFighterId === undefined) {
      setMessageToModal(MESSAGE.NO_SELECT_EDIT_FIGHTER, ModalBgColorType.ERROR);
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

  const selectFighterSetToForm = (fighterId: number) => {
    if (!fighterId) return;
    setSelectFighterId(fighterId);
    const sub = fightersState.fighters!.find((el) => el.id === fighterId);
    if (!!sub) {
      const result = (Object.keys(sub) as (keyof FighterType)[]).reduce((acc, key: keyof FighterType) => {
        return { ...acc, [key]: String(sub[key]) };
      }, {});
      // @ts-ignore
      setFighterInfo(result);
    }
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
            fightersState.fighters.map((el) => (
              <div key={el.id} className={`relative bg-stone-200 m-2`}>
                <input
                  className="absolute top-[50%] left-5 translate-y-[-50%]"
                  id={`${el.id}_${el.name}`}
                  type="radio"
                  name="fighter"
                  value={el.id}
                  onChange={(e) => selectFighterSetToForm(Number(e.target.value))}
                />
                <label className={"w-[90%] cursor-pointer"} htmlFor={`${el.id}_${el.name}`}>
                  <Fighter fighter={el} />
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
