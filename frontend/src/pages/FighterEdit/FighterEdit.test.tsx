import { FighterEdit, _fighterInfo } from ".";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
//! types
import { FighterType } from "@/libs/types/fighter";

//! hooks
import { useFighters } from "@/libs/hooks/fetchers";
import { useMessageController } from "@/libs/hooks/messageController";

//! api
import { updateFighter } from "@/libs/apis/fighterAPI";

//! layout
import { LayoutForEditPage } from "@/layout/LayoutForEditPage";

//! component
import { Fighter } from "@/components/module/Fighter";
import { FighterEditForm } from "@/components/module/FighterEditForm";
import { SpinnerModal } from "@/components/modal/SpinnerModal";
import { EditActionBtns } from "@/components/module/EditActionBtns";
import { FullScreenSpinnerModal } from "@/components/modal/FullScreenSpinnerModal";
import { ReactNode } from "react";

//! test data
import { test_data_fighters, test_data_fighter_2 } from "@/libs/test-data";

//! hooks mock
jest.mock("@/libs/hooks/fetchers");
const useFightersMock = useFighters as jest.Mock;
jest.mock("@/libs/hooks/messageController");
const useMessageControllerMock = useMessageController as jest.Mock;
jest.mock("@/libs/apis/fighterAPI");
const updateFighterMock = updateFighter as jest.Mock;

//! layout mock
jest.mock("@/layout/LayoutForEditPage");
const LayoutForEditPageMock = LayoutForEditPage as jest.Mock;

//! components mock
jest.mock("@/components/module/Fighter");
const FighterMock = Fighter as jest.Mock;
jest.mock("@/components/module/FighterEditForm");
const FighterEditFormMock = FighterEditForm as jest.Mock;
jest.mock("@/components/modal/SpinnerModal");
const SpinnerModalMock = SpinnerModal as jest.Mock;
jest.mock("@/components/module/EditActionBtns");
const EditActionBtnsMock = EditActionBtns as jest.Mock;
jest.mock("@/components/modal/FullScreenSpinnerModal");
const FullScreenSpinnerModalMock = FullScreenSpinnerModal as jest.Mock;

describe("FighterEdigのテスト", () => {
  beforeEach(() => {
    //! hooks mock implement
    useFightersMock.mockReturnValue({
      // fetchAllFighters: jest.fn(),
      data: test_data_fighters,
      // cancel: jest.fn(),
      mutate: jest.fn(),
    });
    useMessageControllerMock.mockReturnValue({ setMessageToModal: jest.fn() });
    updateFighterMock.mockReturnValue(jest.fn());

    //! layout mock implement
    LayoutForEditPageMock.mockImplementation(({ children }: { children: ReactNode }) => {
      return <div>{children}</div>;
    });

    //! component mock implement
    FighterMock.mockImplementation(jest.fn(() => <div>FighterMock</div>));
    FighterEditFormMock.mockReturnValue(<div>FighterEditFormMock</div>);
    SpinnerModalMock.mockReturnValue(<div>SpinnerModalMock</div>);
    EditActionBtnsMock.mockReturnValue(<div>EditActionBtnsMock</div>);
    FullScreenSpinnerModalMock.mockReturnValue(<div>FullScreenSpinnerModalMock </div>);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it("取得した選手データがレンダリングされる", () => {
    render(
      <LayoutForEditPageMock>
        <FighterEdit />
      </LayoutForEditPageMock>
    );
    const FighterMockCount = test_data_fighters.length;
    expect(FighterMock).toBeCalledTimes(FighterMockCount);
  });
  it("セレクトした選手データがFighterEditFormに渡される", () => {
    render(
      <LayoutForEditPageMock>
        <FighterEdit />
      </LayoutForEditPageMock>
    );
    expect(_fighterInfo).toBe(undefined);
    userEvent.click(screen.getByTestId("input-2"));
    expect(_fighterInfo).toBe(test_data_fighter_2);
  });
});
