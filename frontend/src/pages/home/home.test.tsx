import { Home } from ".";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { AuthIs } from "@/store/slice/authUserSlice";
import { useUser, useHasAuth } from "@/store/slice/authUserSlice";
import { useMatches } from "@/store/slice/matchesSlice";

jest.mock("@/store/slice/authUserSlice");
const useUserMock = useUser as jest.Mock;
const useHasAuthMock = useHasAuth as jest.Mock;

jest.mock("@/store/slice/matchesSlice");
const useMathcesMock = useMatches as jest.Mock;

jest.mock("react-redux");
jest.mock("react-router-dom", () => ({
  Link: () => {
    return (
      <a data-testid="login-button" href="/login">
        Loginページ
      </a>
    );
  },
  useNavigate: () => {
    return jest.fn();
  },
}));

const useDispatchMock = useDispatch as jest.Mock;
const useSelectorMock = useSelector as jest.Mock;

describe("ログインしてない場合", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useUserMock.mockReturnValue({ name: "" });
    useMathcesMock.mockReturnValue([{ id: 1, date: "1999/1/1" }]);
    useHasAuthMock.mockReturnValue(AuthIs.FALSE); //ログインの有無
  });
  afterEach(() => {
    useDispatchMock.mockReset();
    useSelectorMock.mockReset();
  });
  // useSelectorMock.mockReturnValue(false)
  it("名前がゲストとなっているかどうか", () => {
    render(<Home />);
    expect(screen.getByTestId(`guest`)).toBeTruthy();
    expect(screen.getByText(/ゲストさん/)).toBeTruthy();
  });

  it("loginボタンはある、logoutボタンはない", () => {
    render(<Home />);
    const loginButton = screen.getByTestId("login-button");
    const logoutButton = screen.queryByTestId("logout-button");
    expect(loginButton).toBeTruthy();
    expect(logoutButton).toBeNull();
  });
});

describe("ログインしてる時", () => {
  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useUserMock.mockReturnValue({ name: "てすと" });
    useMathcesMock.mockReturnValue([{ id: 1, date: "1999/1/1" }]);
    useHasAuthMock.mockReturnValue(AuthIs.TRUE); //ログインの有無
  });
  afterEach(() => {
    useDispatchMock.mockReset();
    useSelectorMock.mockReset();
  });
  it("名前がログインユーザ名になっている", () => {
    render(<Home />);
    expect(screen.getByTestId(`name`)).toBeTruthy();
    expect(screen.getByText(/てすとさん/)).toBeTruthy();
  });
  it("loginボタンはない、logoutボタンはある", () => {
    render(<Home />);
    const loginButton = screen.queryByTestId("login-button");
    const logoutButton = screen.getByTestId("logout-button");
    expect(loginButton).toBeNull();
    expect(logoutButton).toBeTruthy();
  });
});
