import { Comments } from ".";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { FaTrashAlt } from "react-icons/fa";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import matchesReducer from "@/store/slice/matchesSlice";

//エラーコンソールを出さない
jest.spyOn(console, "error").mockImplementation();

const loginUser = {
  id: 1,
  name: "ログインユーザー",
  email: "user@test.com",
};

const redFighter = {
  id: 1,
  name: "赤ボクサー",
  country: "赤国",
  ko: 1,
  win: 1,
  lose: 1,
  draw: 0,
};
const blueFighter = {
  id: 2,
  name: "青ボクサー",
  country: "青国",
  ko: 2,
  win: 2,
  lose: 2,
  draw: 0,
};

const server = setupServer(
  //! logout
  rest.post(`http://localhost:8080/api/logout`, (req, res, context) => {
    return res(context.status(200));
  }),

  //! コメントの登録
  rest.post("http://localhost:8080/api/post_comment", (req, res, context) => {
    return res(context.status(200));
  }),
  //! 試合データの取得
  rest.get("http://localhost:8080/api/match", (req, res, context) => {
    return res(
      context.status(200),
      context.json({
        id: 1,
        date: "2022/1/1",
        red: redFighter,
        blue: blueFighter,
      })
    );
  })
);

// !chertJSのモック
jest.mock("@/components/chart", () => ({
  TestChart: () => {
    return <div>ここにチャートが入るよ</div>;
  },
}));

// !選択されたMatch
jest.mock("@/store/slice/matchesSlice", () => ({
  selectMatches: [
    {
      id: 1,
      date: "2020/05/09",
      red: redFighter,
      blue: blueFighter,
      count_red: 5,
      count_blue: 6,
    },
  ],
}));

// !userが投票した選手
jest.mock("@/store/slice/userVoteSlice", () => ({
  selectVotes: [
    {
      id: 1,
      user_id: 1,
      match_id: 1,
      vote_for: "red",
    },
  ],
}));

// !ログインユーザー
jest.mock("@/store/slice/authUserSlice", () => ({
  selectUser: loginUser,
}));

// !messageモーダルに表示するコメントの取得
jest.mock("@/store/slice/messageByPostCommentSlice", () => ({
  selectMessage: "",
}));

const userComment = "ユーザーのコメント";
// !コメントの取得
jest.mock("@/store/slice/commentsStateSlice", () => ({
  selectComments: [
    {
      id: 1,
      user: loginUser,
      comment: userComment,
      created_at: "2022/03/31",
    },
  ],
  fetchComments: jest.fn(),
}));

//! コメント取得中かどうか
// jest.mock("@/store/slice/commentsStateSlice");
// const selectGettingCommentsStateMock = selectGettingCommentsState as jest.Mock;

// !ゴミ箱アイコン
jest.mock("react-icons/fa");
const FaTrashAltMock = FaTrashAlt as jest.Mock;

//! スピナーをモック
jest.mock("react-loader-spinner", () => ({
  RotatingLines: () => <div>スピナー</div>,
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => {
    return { search: "?id=1" };
  },
  useNavigate: () => {
    return jest.fn().mockReturnValue("/login");
  },
  Link: () => {
    return <a href="/">Homeへ</a>;
  },
}));

jest.mock("react-redux");
const useDispatchMock = useDispatch as jest.Mock;
const useSelectorMock = useSelector as jest.Mock;

describe("てすとです", () => {
  let store: any;
  beforeAll(() => server.listen());

  beforeEach(() => {
    store = configureStore({
      reducer: {
        matches: matchesReducer,
      },
    });
    useDispatchMock.mockReturnValue(jest.fn());
    useSelectorMock.mockImplementation((value) => value);
    FaTrashAltMock.mockImplementation(() => <div>ゴミ箱</div>);
  });

  afterEach(() => {
    cleanup();
    useDispatchMock.mockReset();
    useSelectorMock.mockReset();
    jest.resetAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());
  it("コメントがある時はコメントの一覧が表示される", async () => {
    render(
      // <Provider store={store}>
      <Comments />
      // </Provider>
    );
    const commentEl = await screen.findByText(`${userComment}`);
    await waitFor(() => {
      expect(commentEl).toBeInTheDocument();
    });
  });
  // it("コメントがない時はそのメッセージが表示される", async () => {
  //   render(<Comments />);
  //   const commentEl = await screen.findByText(/コメントはありません/);
  //   await waitFor(() => {
  //     expect(commentEl).toBeInTheDocument();
  //   });
  // });
  it("ログインユーザのコメントがある時、削除ボタンが存在する", async () => {
    render(<Comments />);
    await waitFor(() => {
      expect(screen.getByTestId(`trash-box`)).toBeTruthy();
    });
  });

  it("削除ボタン(ゴミ箱)をクリックした時にモーダルが表示され、キャンセル押下で消える", async () => {
    render(<Comments />);
    const trashBox = await screen.findByTestId(`trash-box`);
    userEvent.click(trashBox);
    expect(screen.getByTestId("delete-modal")).toBeTruthy();
    const cancelButton = screen.getByText(/キャンセル/);
    userEvent.click(cancelButton);
    expect(screen.queryByTestId("delete-modal")).toBeNull();
  });
});
