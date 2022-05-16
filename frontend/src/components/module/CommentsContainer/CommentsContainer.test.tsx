import { CommentsContainer } from ".";
import { cleanup, render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

//! components
import { SpinnerModal } from "@/components/modal/SpinnerModal";

//! hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useDeleteComment, usePostComment, useFetchCommentsOnMatch } from "@/libs/hooks/useComment";
// import { usePostComment } from "@/libs/hooks/usePostComment";
// import { useCommentDelete } from "@/libs/hooks/useCommentDelete";
// import { useCommentsOnMatch } from "@/libs/hooks/fetchers";

//! test data
import { authUser, comments, comment } from "@/libs/test-data";

jest.mock("react-router-dom");
const useLocationMock = useLocation as jest.Mock;

//?spinerのモック
jest.mock("@/components/modal/SpinnerModal");
const SpinnerModalMock = SpinnerModal as jest.Mock;

//?ログインユーザーのモック
jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

//? コメントのモック
jest.mock("@/libs/hooks/useComment");
const usePostCommentMock = usePostComment as jest.Mock;
const useDeleteCommentMock = useDeleteComment as jest.Mock;
const useFetchCommentsOnMatchMock = useFetchCommentsOnMatch as jest.Mock;
// const useCommentsOnMatchMock = useCommentsOnMatch as jest.Mock;
const useFetchCommentsOnMatchMockReturnValue = {
  data: comments,
  error: jest.fn(),
  mutate: jest.fn(),
};
// jest.mock("@/libs/hooks/useFetchThisMatchComments");
// const useFetchThisMatchCommentsMock = useFetchThisMatchComments as jest.Mock;
// const useFetchThisMatchCommentsMockReturnValue = {
//   fetchThisMatchComments: jest.fn(),
//   clearComments: jest.fn(),
//   cancelFetchComments: jest.fn(),
// };

// jest.mock("@/libs/hooks/useCommentDelete");

let data: typeof authUser;
describe("CommentsContainerのテスト", () => {
  beforeEach(() => {
    // const authState = authUser;
    useLocationMock.mockReturnValue(jest.fn());
    data = authUser;
    useAuthMock.mockReturnValue({ data });
    useFetchCommentsOnMatchMock.mockReturnValue(useFetchCommentsOnMatchMockReturnValue);
    // useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    usePostCommentMock.mockReturnValue({ commentPosting: false });
    useDeleteCommentMock.mockReturnValue({ deleteCommentsState: { pending: false } });
  });

  afterEach(() => {
    cleanup();
  });

  it("投稿されたコメントが表示されている", () => {
    render(<CommentsContainer />);
    expect(screen.getByText(comment)).toBeInTheDocument();
  });

  it("コメントがない場合の表示が正しい", () => {
    // const commentsState = { comments: [], pending: false, hasNotComments: true };
    const useCommentsOnMatchMockReturnValue = {
      data: [],
      error: jest.fn(),
      mutate: jest.fn(),
    };
    useFetchCommentsOnMatchMock.mockReturnValue(useCommentsOnMatchMockReturnValue);
    // useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    render(<CommentsContainer />);
    expect(screen.getByText("コメントはありません")).toBeInTheDocument();
  });

  it("pending状態の時はspinerが表示される", () => {
    // const commentsState = { comments: [], pending: true, hasNotComments: true };
    const useCommentsOnMatchMockReturnValue = {
      data: undefined,
      error: jest.fn(),
      mutate: jest.fn(),
    };
    useFetchCommentsOnMatchMock.mockReturnValue(useCommentsOnMatchMockReturnValue);
    // useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    SpinnerModalMock.mockImplementation(jest.fn(() => <div>スピナー</div>));
    render(<CommentsContainer />);
    expect(screen.getByText("スピナー")).toBeInTheDocument();
  });
});
