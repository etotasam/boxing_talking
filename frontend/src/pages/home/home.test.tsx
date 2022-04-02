import { Home } from ".";
import { render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { AuthIs } from "@/store/slice/authUserSlice";

jest.mock("react-redux");
jest.mock("react-router-dom", () => ({
  Link: () => {
    return <a href="/login">Loginページ</a>;
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
    useSelectorMock.mockReturnValueOnce({ name: "てすと" }); //ログインユーザ名
    useSelectorMock.mockReturnValueOnce(AuthIs.FALSE); //ログインの有無
    useSelectorMock.mockReturnValueOnce([{ id: 1, date: "1999/1/1" }]);
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
});

describe("ログインしてる時", () => {
  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useSelectorMock.mockReturnValueOnce({ name: "てすと" }); //ログインユーザ名
    useSelectorMock.mockReturnValueOnce(AuthIs.TRUE); //ログインの有無
    useSelectorMock.mockReturnValueOnce([{ id: 1, date: "1999/1/1" }]);
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
});
