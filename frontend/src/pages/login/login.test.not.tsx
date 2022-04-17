import { Login } from ".";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useDispatch, useSelector } from "react-redux";

//エラーコンソールを出さない
jest.spyOn(console, "error").mockImplementation();

const mockeServer = setupServer(
  rest.get("http://localhost:8080/sanctum/csrf-cookie", (req, res, context) => {
    return;
  }),
  rest.post<Record<string, string>>(
    "http://localhost:8080/api/login",
    (req, res, context) => {
      return res(context.status(401));
    }
  )
);

const testMessage = "てすとこめんと";
const messageWhenFaildLogin = "※ログインに失敗しました";
jest.mock("react-redux");
const useDispatchMock = useDispatch as jest.Mock;
const useSelectorMock = useSelector as jest.Mock;

jest.mock("react-router-dom", () => ({
  Link: () => {
    return <a href="/">Homeへ</a>;
  },
  useNavigate: () => {
    return "/";
  },
  useLocation: () => {
    return { state: { message: testMessage } };
  },
}));

describe("login.tsx", () => {
  beforeAll(() => mockeServer.listen());

  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useSelectorMock.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    mockeServer.resetHandlers();
    cleanup();
  });

  afterAll(() => {
    mockeServer.close();
    jest.resetAllMocks();
  });

  it(`useLocationでメッセージを受けた時は表示される`, () => {
    render(<Login />);
    expect(screen.getByText(testMessage)).toBeTruthy();
  });

  it("ログインボタンを押下してログインに失敗した時", async () => {
    const { rerender } = render(<Login />);
    const button = screen.getByRole(`button`);
    userEvent.click(button);
    rerender(<Login />);
    const asyncMessage = await screen.findByText(messageWhenFaildLogin);
    expect(asyncMessage).toBeInTheDocument();
  });
});
