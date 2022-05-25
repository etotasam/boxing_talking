import { Home } from ".";
import { render, screen } from "@testing-library/react";
// import { useUser, useHasAuth } from "@/store/slice/authUserSlice";
import { useAuth } from "@/libs/hooks/useAuth";
// import { useMatches } from "@/store/slice/matchesSlice";
import { useFetchMatches } from "@/libs/hooks/useMatches";

//! component
import { LayoutDefault } from "@/layout/LayoutDefault";
// import { Header } from "@/components/module/Header";

//! component mock
jest.mock("@/layout/LayoutDefault");
const LayoutDefaultMock = LayoutDefault as jest.Mock;

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;
// const useHasAuthMock = useHasAuth as jest.Mock;

jest.mock("@/libs/hooks/useMatches");
const useFetchMatchesMock = useFetchMatches as jest.Mock;

// jest.mock("react-redux");
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

describe("ログインしてない場合", () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    LayoutDefaultMock.mockImplementation(({ children }) => <div>{children}</div>);
    useAuthMock.mockReturnValue({ name: "" });
    // useMathcesMock.mockReturnValue([{ id: 1, date: "1999/1/1" }]);
    useFetchMatchesMock.mockReturnValue({
      matches: [{ id: 1, date: "1999/1/1" }],
    });
    // useHasAuthMock.mockReturnValue(AuthIs.FALSE); //ログインの有無
  });
  afterEach(() => {});
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
    useAuthMock.mockReturnValue({ name: "てすと" });
    // useMathcesMock.mockReturnValue([{ id: 1, date: "1999/1/1" }]);
    useFetchMatchesMock.mockReturnValue({
      matches: [{ id: 1, date: "1999/1/1" }],
    });
    // useHasAuthMock.mockReturnValue(AuthIs.TRUE); //ログインの有無
  });
  afterEach(() => {});
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
