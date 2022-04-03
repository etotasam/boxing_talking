import { render, screen } from "@testing-library/react";
import { Check } from ".";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { Provider, useSelector, useDispatch } from "react-redux";
// import { configureStore } from "@reduxjs/toolkit";
// import commentsReducer from "@/store/slice/commentsStateSlice";
// import authUserReducer from "@/store/slice/authUserSlice";

const server = setupServer(
  rest.get(`http://localhost:8080/api/get_comments`, (req, res, context) => {
    return res(
      context.status(200),
      context.json([
        {
          id: 1,
          user: {
            id: 1,
            name: "名前",
            email: "メールアドレス",
          },
          comment: "取得コメント1",
          created_at: "2022/4/2",
        },
        {
          id: 2,
          user: {
            id: 1,
            name: "名前",
            email: "メールアドレス",
          },
          comment: "取得コメント2",
          created_at: "2022/4/2",
        },
      ])
    );
  })
);

jest.mock("@/store/slice/commentsStateSlice", () => ({
  selectGettingCommentsState: false,
}));

jest.mock("@/store/slice/commentsStateSlice", () => ({
  selectComments: [
    {
      id: 2,
      user: {
        id: 1,
        name: "名前",
        email: "メールアドレス",
      },
      comment: "取得コメント2",
      created_at: "2022/4/2",
    },
  ],
}));

const dispatchMock = jest.fn();
const selectorMock = jest.fn().mockImplementation(() => {
  return [
    {
      id: 2,
      user: {
        id: 1,
        name: "名前",
        email: "メールアドレス",
      },
      comment: "取得コメント2",
      created_at: "2022/4/2",
    },
  ];
});
jest.mock("react-redux", () => ({
  useDispatch: dispatchMock(),
  useSelector: selectorMock(),
}));
// const useSelectorMock = useSelector as jest.Mock;
// const useDispatchMock = useDispatch as jest.Mock;
// const mockDispatch = jest.fn()
// const selectorMock = jest.fn().mockImplementation(() => )
describe("check.tsx", () => {
  // let store: any;
  beforeAll(() => server.listen());

  beforeEach(() => {
    server.resetHandlers();
    jest.mock("react-redux");
  });

  afterAll(() => server.close());

  it("テストのてすと", async () => {
    // useDispatchMock.mockReturnValue(jest.fn());
    // useSelectorMock.mockImplementation(() => [
    //   {
    //     id: 2,
    //     user: {
    //       id: 1,
    //       name: "名前",
    //       email: "メールアドレス",
    //     },
    //     comment: "取得コメント2",
    //     created_at: "2022/4/2",
    //   },
    // ]);

    render(<Check />);
    expect(await screen.findByText("ユーザー名")).toBeTruthy();
  });
});
