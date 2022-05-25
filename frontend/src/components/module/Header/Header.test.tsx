import { Header } from ".";
import { CustomLink } from "@/components/module/CustomLink";
import { cleanup, render, screen } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { act, renderHook, RenderHookResult } from "@testing-library/react-hooks";
import { QueryClientProvider, QueryClient } from "react-query";
//! hooks
import { useQueryState } from "@/libs/hooks/useQueryState";
//! auth data
import { useAuth } from "@/libs/hooks/useAuth";
//! test data
import { authUser } from "@/libs/test-data";

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;
jest.mock("@/libs/hooks/useQueryState");
const useQueryStateMock = useQueryState as jest.Mock;

jest.mock("@/components/module/CustomLink");
const CustomLinkMock = CustomLink as jest.Mock;

jest.mock("react-router-dom");
const useLocationMock = useLocation as jest.Mock;
const useNavigateMock = useNavigate as jest.Mock;

jest.mock("@/components/module/LogoutBtn", () => ({
  LogoutBtn: () => {
    return <button>Logoutボタン</button>;
  },
}));

jest.mock("@/components/module/LoginForm", () => ({
  LoginForm: () => {
    return <button>Loginボタン</button>;
  },
}));

type wrapperType = { children: React.ReactNode };

describe("Headerテスト", () => {
  const queryClient = new QueryClient();
  const Wrapper = ({ children }: wrapperType) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    const data = authUser;
    useQueryStateMock.mockReturnValue(jest.fn());
    useAuthMock.mockReturnValue({ data });
    useLocationMock.mockReturnValue({ pathname: "/comments" });
    CustomLinkMock.mockReturnValue(<a href="/">Homeへ</a>);
    useNavigateMock.mockImplementation();
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("login時、名前はauth userでlogoutボタンがある", () => {
    render(
      <Wrapper>
        <Header />
      </Wrapper>
    );
    const logoutBtn = screen.getByText("Logoutボタン");
    const loginBtn = screen.queryByText("Loginボタン");
    const authUserName = screen.getByText("auth userさん");
    expect(logoutBtn).toBeInTheDocument();
    expect(loginBtn).toBeNull();
    expect(authUserName).toBeInTheDocument();
  });
  it("logout時、名前はゲストでloginボタンが存在する", () => {
    useAuthMock.mockReturnValue({ authState: undefined });
    render(
      <Wrapper>
        <Header />
      </Wrapper>
    );
    const logoutBtn = screen.queryByText("Logoutボタン");
    const loginBtn = screen.getByText("ログイン");
    const authUserName = screen.getByText("ゲストさん");
    expect(logoutBtn).toBeNull();
    expect(loginBtn).toBeInTheDocument();
    expect(authUserName).toBeInTheDocument();
  });

  it("homeを表示時 Homeへ ボタンが存在しない", () => {
    useLocationMock.mockReturnValue({ pathname: "/" });
    render(
      <Wrapper>
        <Header />
      </Wrapper>
    );
    const linkBtn = screen.queryByText("Homeへ");
    expect(linkBtn).toBeNull();
  });

  it("表示がhome以外の時 Homeへ ボタンが存在する", () => {
    useLocationMock.mockReturnValue({ pathname: "/comments" });
    render(
      <Wrapper>
        <Header />
      </Wrapper>
    );
    const linkBtn = screen.getByText("Homeへ");
    expect(linkBtn).toBeInTheDocument();
  });
});
