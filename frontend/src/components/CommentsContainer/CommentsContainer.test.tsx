import { CommentsContainer } from ".";
import { cleanup, render, screen } from "@testing-library/react";
import { useLocation } from "react-router-dom";

// components
import SpinnerModal from "@/components/SpinnerModal";

// hooks
import { useAuth } from "@/libs/hooks/useAuth";
import { useFetchThisMatchComments } from "@/libs/hooks/useFetchThisMatchComments";
import { usePostComment } from "@/libs/hooks/usePostComment";
import { useCommentDelete } from "@/libs/hooks/useCommentDelete";

// test data
import { authUserState, commentsState, comment } from "@/libs/test-data";

jest.mock("react-router-dom");
const useLocationMock = useLocation as jest.Mock;

//spinerのモック
jest.mock("@/components/SpinnerModal");
const SpinnerModalMock = SpinnerModal as jest.Mock;

//ログインユーザーのモック
jest.mock("@/libs/hooks/useAuth");
const useAuthMock = useAuth as jest.Mock;

// コメントのモック
jest.mock("@/libs/hooks/useFetchThisMatchComments");
const useFetchThisMatchCommentsMock = useFetchThisMatchComments as jest.Mock;
const useFetchThisMatchCommentsMockReturnValue = {
  fetchThisMatchComments: jest.fn(),
  clearComments: jest.fn(),
  cancelFetchComments: jest.fn(),
};

jest.mock("@/libs/hooks/usePostComment");
const usePostCommentMock = usePostComment as jest.Mock;

jest.mock("@/libs/hooks/useCommentDelete");
const useCommentDeleteMock = useCommentDelete as jest.Mock;

describe("CommentsContainerのテスト", () => {
  beforeEach(() => {
    const authState = authUserState.auth;
    useLocationMock.mockReturnValue(jest.fn());
    useAuthMock.mockReturnValue({ authState });
    useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    usePostCommentMock.mockReturnValue({ commentPosting: false });
    useCommentDeleteMock.mockReturnValue({ deleteCommentsState: { pending: false } });
  });

  afterEach(() => {
    cleanup();
  });

  it("投稿されたコメントが表示されている", () => {
    render(<CommentsContainer />);
    expect(screen.getByText(comment)).toBeInTheDocument();
  });

  it("コメントがない場合の表示が正しい", () => {
    const commentsState = { comments: [], pending: false, hasNotComments: true };
    useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    render(<CommentsContainer />);
    expect(screen.getByText("コメントはありません")).toBeInTheDocument();
  });

  it("pending状態の時はspinerが表示される", () => {
    const commentsState = { comments: [], pending: true, hasNotComments: true };
    useFetchThisMatchCommentsMock.mockReturnValue({ commentsState, ...useFetchThisMatchCommentsMockReturnValue });
    SpinnerModalMock.mockImplementation(jest.fn(() => <div>スピナー</div>));
    render(<CommentsContainer />);
    expect(screen.getByText("スピナー")).toBeInTheDocument();
  });
});
