import { Header } from ".";
import { CustomLink } from "@/components/CustomLink";
import { cleanup, render, screen } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
// auth data
import { useAuth } from "@/libs/hooks/useAuth";

// test data
import { authUserState, notAuthState } from "@/libs/test-data";

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

jest.mock("@/components/CustomLink");
const CustomLinkMock = CustomLink as jest.Mock;

jest.mock("react-router-dom");
const useLocationMock = useLocation as jest.Mock;
const useNavigateMock = useNavigate as jest.Mock;

jest.mock("@/components/LogoutBtn", () => ({
  LogoutBtn: () => {
    return <button>Logoutボタン</button>;
  },
}));

jest.mock("@/components/LoginForm", () => ({
  LoginForm: () => {
    return <button>Loginボタン</button>;
  },
}));

describe("Headerテスト", () => {
  beforeAll(() => {});

  beforeEach(() => {
    const authState = authUserState.auth;
    useAuthMock.mockReturnValue({ authState });
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
    render(<Header />);
    const logoutBtn = screen.getByText("Logoutボタン");
    const loginBtn = screen.queryByText("Loginボタン");
    const authUserName = screen.getByText("auth userさん");
    expect(logoutBtn).toBeInTheDocument();
    expect(loginBtn).toBeNull();
    expect(authUserName).toBeInTheDocument();
  });
  it("logout時、名前はゲストでloginボタンが存在する", () => {
    useAuthMock.mockReturnValue({ authState: notAuthState });
    render(<Header />);
    const logoutBtn = screen.queryByText("Logoutボタン");
    const loginBtn = screen.getByText("Loginボタン");
    const authUserName = screen.getByText("ゲストさん");
    expect(logoutBtn).toBeNull();
    expect(loginBtn).toBeInTheDocument();
    expect(authUserName).toBeInTheDocument();
  });

  it("homeを表示時 Homeへ ボタンが存在しない", () => {
    useLocationMock.mockReturnValue({ pathname: "/" });
    render(<Header />);
    const linkBtn = screen.queryByText("Homeへ");
    expect(linkBtn).toBeNull();
  });

  it("表示がhome以外の時 Homeへ ボタンが存在する", () => {
    useLocationMock.mockReturnValue({ pathname: "/comments" });
    render(<Header />);
    const linkBtn = screen.getByText("Homeへ");
    expect(linkBtn).toBeInTheDocument();
  });
});
