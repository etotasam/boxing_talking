import { cleanup, render, screen } from "@testing-library/react";
import { CommentComponent } from ".";

// hooks
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useAuth } from "@/libs/hooks/useAuth";

// コメント投稿ユーザー
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
  created_at: new Date("2022/4/13"),
};

// ログインユーザー
const authState = {
  user,
};

jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

jest.mock("@/libs/hooks/useCommentDelete");
const useCommentDeleteMock = useCommentDelete as jest.Mock;

describe("CommentComponentのテスト", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ authState });
    useCommentDeleteMock.mockReturnValue(jest.fn());
  });

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("auth userのコメントにはゴミ箱が表示される", () => {
    render(<CommentComponent props={commentState} className={"className"} />);
    const trashBox = screen.getByTestId(`trash-box`);
    expect(trashBox).toBeInTheDocument();
  });

  it("not auth user のコメントにはゴミ箱は表示されない", () => {
    useAuthMock.mockReturnValue({ authState: { user: { id: 2, name: "ユーザー", email: "notAuthUser@test.com" } } });
    render(<CommentComponent props={commentState} className={"className"} />);
    const trashBox = screen.queryByTestId(`trash-box`);
    expect(trashBox).toBeNull();
  });
});
