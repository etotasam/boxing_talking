import { Match } from ".";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { rest } from "msw";
import { setupServer } from "msw/node";
import userEvent from "@testing-library/user-event";
import { FaTrashAlt } from "react-icons/fa";

import { useAuth } from "@/libs/hooks/useAuth";
import { useMessage } from "@/store/slice/messageByPostCommentSlice";

// hooks
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useFetchAllMatches } from "@/libs/hooks/useFetchAllMatches";
import { useFetchVoteResult } from "@/libs/hooks/useFetchVoteResult";

//エラーコンソールを出さない
jest.spyOn(console, "error").mockImplementation();

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
const matches = [
  {
    id: 1,
    date: "2020/05/09",
    red: redFighter,
    blue: blueFighter,
    count_red: 5,
    count_blue: 6,
  },
];
jest.mock("@/libs/hooks/useFetchAllMatches");
const useFetchAllMatchesMock = useFetchAllMatches as jest.Mock;

// !userが投票した選手
const votes = [
  {
    id: 1,
    user_id: 1,
    match_id: 1,
    vote_for: "red",
  },
];
jest.mock("@/libs/hooks/useFetchVoteResult");
const useFetchVoteResultMock = useFetchVoteResult as jest.Mock;

// !ログインユーザー
const loginUser = {
  id: 1,
  name: "ログインユーザー",
  email: "user@test.com",
};

//! その他のユーザー
const otherUser = {
  id: 2,
  name: "その他のユーザ",
  email: "other@test.com",
};

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

// !messageモーダルに表示するコメントの取得
jest.mock("@/store/slice/messageByPostCommentSlice");
const useMessageMock = useMessage as jest.Mock;

// !コメントの取得
const userComment = "ユーザーのコメント";
const authUserComment = {
  id: 1,
  user: loginUser,
  comment: userComment,
  created_at: "2022/03/31",
};
const nonAuthUserComment = {
  id: 2,
  user: otherUser,
  comment: "ログインしてない人のコメント",
  created_at: "2022/03/31",
};
const commentInfo = [authUserComment];
jest.mock("@/store/slice/commentsStateSlice");

jest.mock("@/libs/hooks/postComment");
const usePostCommentMock = usePostComment as jest.Mock;

jest.mock("@/libs/hooks/commentDelete");
const useCommentDeleteMock = useCommentDelete as jest.Mock;

//! コメント取得中かどうか

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
  beforeAll(() => server.listen());

  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useSelectorMock.mockImplementation((value) => value);
    FaTrashAltMock.mockImplementation(() => <div>ゴミ箱</div>);

    useAuthMock.mockReturnValue(loginUser);
    useMessageMock.mockReturnValue("");
    useFetchVoteResultMock.mockReturnValue({ voteResultState: { votes } });
    useFetchAllMatchesMock.mockReturnValue({
      matchesState: { matches: matches },
    });

    usePostCommentMock.mockReturnValue({ commentPostPending: false });
    useCommentDeleteMock.mockReturnValue({
      isDeletingPending: false,
      isOpenDeleteConfirmModal: true,
      getDeleteCommentId: jest.fn(),
      openDeleteConfirmModale: jest.fn(),
    });
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
      <Match />
      // </Provider>
    );
    const commentEl = await screen.findByText(`${userComment}`);
    await waitFor(() => {
      expect(commentEl).toBeInTheDocument();
    });
  });
  it("コメントがない時はそのメッセージが表示される", async () => {
    // useCommentsMock.mockReturnValue([]);
    // useHasNotCommentMock.mockReturnValue(true);
    render(<Match />);
    const commentEl = await screen.findByText(/コメントはありません/);
    expect(commentEl).toBeInTheDocument();
  });
  it("authユーザのコメントに削除ボタンが存在する", async () => {
    render(<Match />);
    expect(await screen.findByTestId(`trash-box`)).toBeTruthy();
  });

  it("no authユーザのコメントには削除ボタンは存在しない", async () => {
    // useCommentsMock.mockReturnValue([nonAuthUserComment]);
    render(<Match />);
    await waitFor(() => {
      const trashBox = screen.queryByTestId(`trash-box`);
      expect(trashBox).toBeNull();
    });
  });

  it("削除ボタン(ゴミ箱)をクリックした時にモーダルが表示され、キャンセル押下で消える", async () => {
    const { rerender } = render(<Match />);
    const trashBox = await screen.findByTestId(`trash-box`);
    userEvent.click(trashBox);
    expect(screen.getByTestId("delete-modal")).toBeTruthy();
    const cancelButton = screen.getByText(/キャンセル/);
    userEvent.click(cancelButton);
    useCommentDeleteMock.mockReturnValue({
      isDeletingPending: false,
      isOpenDeleteConfirmModal: false,
    });
    rerender(<Match />);
    expect(screen.queryByTestId("delete-modal")).toBeNull();
  });
});
