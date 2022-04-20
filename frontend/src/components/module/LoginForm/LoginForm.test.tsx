import { LoginForm } from ".";
import { cleanup, render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// hooks
import { useLogin } from "@/libs/hooks/useLogin";

jest.mock("react-router-dom");
const useLocationMock = useLocation as jest.Mock;

jest.mock("@/libs/hooks/useLogin");
const useLoginMock = useLogin as jest.Mock;

describe("LoginFormのテスト", () => {
  beforeEach(() => {
    useLocationMock.mockReturnValue({ state: { message: "メッセージ" } });
    useLoginMock.mockReturnValue({ login: jest.fn(), loginState: { pending: false } });
  });
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
  it("emailとpasswordが正しく入力された時login()が呼び出される", () => {
    const loginSpy = jest.spyOn(useLoginMock(), "login");
    render(<LoginForm />);
    const inputEmail = screen.getByPlaceholderText("Email");
    const inputPass = screen.getByPlaceholderText("Password");
    const loginBtn = screen.getByTestId("login-btn");
    userEvent.type(inputEmail, "test@test.com");
    userEvent.type(inputPass, "test");
    userEvent.click(loginBtn);
    expect(loginSpy).toBeCalledTimes(1);
  });
  it("無効なemailの場合、その旨を伝えるnoticeが表示される", () => {
    const loginSpy = jest.spyOn(useLoginMock(), "login");
    render(<LoginForm />);
    const inputEmail = screen.getByPlaceholderText("Email");
    const inputPass = screen.getByPlaceholderText("Password");
    const loginBtn = screen.getByTestId("login-btn");
    userEvent.type(inputEmail, "test");
    userEvent.type(inputPass, "test");
    userEvent.click(loginBtn);
    expect(screen.getByText("有効なEmailではありません")).toBeInTheDocument();
    expect(loginSpy).toBeCalledTimes(0);
  });
  it("email,passwordが未入力の場合、入力を促すnoticeの表示。✕ボタンで非表示になる", () => {
    const loginSpy = jest.spyOn(useLoginMock(), "login");
    render(<LoginForm />);
    const loginBtn = screen.getByTestId("login-btn");
    userEvent.click(loginBtn);
    expect(screen.getByText("emailとpasswordの入力は必須です")).toBeInTheDocument();
    expect(loginSpy).toBeCalledTimes(0);
    const hideNoticeBtn = screen.getByTestId("hide-notice-btn");
    userEvent.click(hideNoticeBtn);
    expect(screen.queryByText("emailとpasswordの入力は必須です")).toBeNull();
  });
});
