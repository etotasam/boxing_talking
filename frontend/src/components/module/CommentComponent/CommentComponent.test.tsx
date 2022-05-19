import { cleanup, render, screen } from "@testing-library/react";
import { CommentComponent } from ".";

//! hooks
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useDeleteComment } from "@/libs/hooks/useComment";
import { useAuth } from "@/libs/hooks/useAuth";

// コメント投稿ユーザー & ログインユーザー
const user = {
  id: 1,
  name: "ログインユーザー",
  email: "authUser@test.com",
};

// コメントの情報
const commentState = {
  id: 1,
  comment: "こめんと",
  user: user,
  vote: "red",
  created_at: new Date("2022/4/13"),
};

let data: typeof user;

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

jest.mock("@/libs/hooks/useComment");
const useDeleteCommentMock = useDeleteComment as jest.Mock;

describe("CommentComponentのテスト", () => {
  beforeEach(() => {
    data = user;
    useAuthMock.mockReturnValue({ data });
    useDeleteCommentMock.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("auth userのコメントにはゴミ箱が表示される", () => {
    render(<CommentComponent commentData={commentState} className={"className"} />);
    const trashBox = screen.getByTestId(`trash-box`);
    expect(trashBox).toBeInTheDocument();
  });

  it("not auth user のコメントにはゴミ箱は表示されない", () => {
    data = { id: 2, name: "ユーザー", email: "notAuthUser@test.com" };
    useAuthMock.mockReturnValue({ data });
    render(<CommentComponent commentData={commentState} className={"className"} />);
    const trashBox = screen.queryByTestId(`trash-box`);
    expect(trashBox).toBeNull();
  });
});
