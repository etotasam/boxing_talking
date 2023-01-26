import { cleanup, render, screen } from "@testing-library/react";
import { CommentComponent } from ".";
import { QueryClientProvider, QueryClient } from "react-query";
//! hooks
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
import { useDeleteComment } from "@/libs/hooks/useComment";
import { useAuth } from "@/libs/hooks/useAuth";

// コメント投稿ユーザー & ログインユーザー
const user = {
  id: "1",
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

type wrapperType = { children: React.ReactNode };

describe("CommentComponentのテスト", () => {
  const queryClient = new QueryClient();
  const Wrapper = ({ children }: wrapperType) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

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
    render(
      <Wrapper>
        <CommentComponent commentData={commentState} className={"className"} />
      </Wrapper>
    );
    const trashBox = screen.getByTestId(`trash-box`);
    expect(trashBox).toBeInTheDocument();
  });

  it("not auth user のコメントにはゴミ箱は表示されない", () => {
    data = { id: "2", name: "ユーザー", email: "notAuthUser@test.com" };
    useAuthMock.mockReturnValue({ data });
    render(
      <Wrapper>
        <CommentComponent commentData={commentState} className={"className"} />
      </Wrapper>
    );
    const trashBox = screen.queryByTestId(`trash-box`);
    expect(trashBox).toBeNull();
  });
});
