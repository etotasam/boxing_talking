import { FighterEdit, _selectFighter } from ".";
import { cleanup, queryByTitle, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { act, renderHook } from "@testing-library/react-hooks";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { queryKeys } from "@/libs/queryKeys";
//! message contoller
import { useToastModal, ModalBgColorType } from "@/libs/hooks/useToastModal";
import { MESSAGE } from "@/libs/utils";

//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
import {
  useFetchFighters,
  useUpdateFighter,
  useDeleteFighter,
  // useCountFighters,
} from "@/libs/hooks/useFighter";

//! api
// import { updateFighter } from "@/libs/apis/fighterAPI";

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
import { test_data_fighters, test_data_fighter_2, test_data_fighter_1 } from "@/libs/test-data";
import { initialFighterInfoState } from "@/components/module/FighterEditForm";
import { JsxEmit } from "typescript";

//! hooks mock
// jest.mock("@/libs/hooks/fetchers");
// const useFightersMock = useFighters as jest.Mock;

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Link: () => {
    return <a href="/page">page</a>;
  },
  useLocation: () => {
    return { search: jest.fn() };
  },
  useNavigate: () => {
    return jest.fn();
  },
}));

jest.mock("@/libs/hooks/useFighter");
const useFetchFightersMock = useFetchFighters as jest.Mock;
const useUpdateFighterMock = useUpdateFighter as jest.Mock;
const useDeleteFighterMock = useDeleteFighter as jest.Mock;
jest.mock("@/libs/hooks/useQueryState");
const useQueryStateMock = useQueryState as jest.Mock;

//! layout mock
jest.mock("@/layout/LayoutForEditPage");
const LayoutForEditPageMock = LayoutForEditPage as jest.Mock;

//! components mock
jest.mock("@/components/module/Fighter");
//@ts-ignore
const FighterMock = Fighter as jest.Mock;
jest.mock("@/components/module/FighterEditForm");
const FighterEditFormMock = FighterEditForm as jest.Mock;
jest.mock("@/components/modal/SpinnerModal");
const SpinnerModalMock = SpinnerModal as jest.Mock;
jest.mock("@/components/module/EditActionBtns");
const EditActionBtnsMock = EditActionBtns as jest.Mock;
jest.mock("@/components/modal/FullScreenSpinnerModal");
const FullScreenSpinnerModalMock = FullScreenSpinnerModal as jest.Mock;

const clientStub = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      //?※refetchが走らないように
      staleTime: Infinity,
    },
  },
});
clientStub.setQueryData(queryKeys.fighterEditData, initialFighterInfoState);
clientStub.setQueryData(queryKeys.isSelectedFighter, false);
clientStub.setQueryData(queryKeys.fighterPaginate, undefined);

describe("FighterEditのテスト", () => {
  let setFighterDataFromFormMock = jest.fn();
  let setIsSelectedFighterMock = jest.fn();
  let setFighterPaginateMock = jest.fn();
  beforeEach(() => {
    // useQuerySpy.mockImplementation((queryKey: string) => {
    //   if (queryKey === queryKeys.fighterEditData) {
    //     return { data: "data" };
    //   }
    // });
    //! hooks mock implement
    useFetchFightersMock.mockReturnValue({
      data: test_data_fighters,
      isError: false,
      isLoading: false,
    });
    useQueryStateMock.mockImplementation(
      jest.fn((queryKey: string) => {
        if (queryKey === queryKeys.fighterEditData) {
          let fighterDataFromForm = clientStub.getQueryData(queryKey);
          setFighterDataFromFormMock.mockImplementation(
            jest.fn((data: any) => clientStub.setQueryData(queryKey, data))
          );
          return { state: fighterDataFromForm, setter: setFighterDataFromFormMock };
        }
        if (queryKey === queryKeys.isSelectedFighter) {
          let isSelectedFighter = clientStub.getQueryData(queryKey);
          setIsSelectedFighterMock.mockImplementation(
            jest.fn((data: any) => clientStub.setQueryData(queryKey, data))
          );
          return { state: isSelectedFighter, setter: setIsSelectedFighterMock };
        }
        if (queryKey === queryKeys.fighterPaginate) {
          let fighterPaginate = clientStub.getQueryData(queryKey);
          setFighterPaginateMock.mockImplementation(
            jest.fn((data: any) => clientStub.setQueryData(queryKey, data))
          );
          return { state: fighterPaginate, setter: setFighterPaginateMock };
        }
      })
    );
    useUpdateFighterMock.mockReturnValue({
      updateFighter: jest.fn(),
      isLoading: false,
    });

    useDeleteFighterMock.mockReturnValue({
      deleteFighter: jest.fn(),
      isLoading: false,
    });

    //! layout mock implement
    LayoutForEditPageMock.mockImplementation(({ children }: { children: ReactNode }) => {
      return <div>{children}</div>;
    });

    //! component mock implement
    FighterMock.mockImplementation(() => <div>FighterMock</div>);
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
      <QueryClientProvider client={clientStub}>
        <LayoutForEditPageMock>
          <FighterEdit />
        </LayoutForEditPageMock>
      </QueryClientProvider>
    );

    const FighterMockCount = test_data_fighters.length;
    expect(FighterMock).toBeCalledTimes(FighterMockCount);
  });
  it("セレクトした選手データがuseQueryStateで共有される", () => {
    const { rerender } = render(
      <QueryClientProvider client={clientStub}>
        <LayoutForEditPageMock>
          <FighterEdit />
        </LayoutForEditPageMock>
      </QueryClientProvider>
    );
    expect(_selectFighter).toBe(initialFighterInfoState);
    // screen.debug();
    userEvent.click(screen.getByTestId("input-2"));
    expect(setFighterDataFromFormMock).toBeCalledTimes(1);
    rerender(
      <QueryClientProvider client={clientStub}>
        <LayoutForEditPageMock>
          <FighterEdit />
        </LayoutForEditPageMock>
      </QueryClientProvider>
    );
    expect(_selectFighter).toStrictEqual(test_data_fighter_2);
  });
});
