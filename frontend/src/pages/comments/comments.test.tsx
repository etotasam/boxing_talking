import { Comments } from ".";
import { render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { rest } from "msw";
import { setupServer } from "msw/node";

const redFighter = {
  id: 1,
  name: "赤ボクサー",
  country: "国",
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

  //! コメントの取得
  rest.get(`http://localhost:8080/api/get_comments`, (req, res, context) => {
    // const id = req.url.searchParams.get("match_id");
    return res(
      context.status(200),
      context.json([
        {
          id: 1,
          user: {
            id: 1,
            name: "てらかど",
            email: "terakado@test.com",
          },
          comment: "てすとこめんと",
        },
      ])
    );
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

jest.mock("react-redux");
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

const useDispatchMock = useDispatch as jest.Mock;
const useSelectorMock = useSelector as jest.Mock;

describe("てすとです", () => {
  beforeAll(() => server.listen());

  beforeEach(() => {
    useDispatchMock.mockReturnValue(jest.fn());
    useSelectorMock.mockReturnValue({ id: 2, name: "うんこ" });
    useSelectorMock.mockReturnValueOnce([
      { id: 1, date: "1991/1/1", red: redFighter, blue: blueFighter },
    ]);
    useSelectorMock.mockReturnValueOnce({ name: "てらしま1", id: 100 });
    useSelectorMock.mockReturnValueOnce({ name: "てらしま2", id: 200 });
    useSelectorMock.mockReturnValueOnce({ name: "てらしま3", id: 300 });
  });

  afterEach(() => {
    useDispatchMock.mockReset();
    useSelectorMock.mockReset();
    server.resetHandlers();
  });

  afterAll(() => server.close());
  it("コメントがある時", async () => {
    render(<Comments />);
    const loadingEl = screen.getByText("loading...");
    expect(loadingEl).toBeInTheDocument();
    const commentEl = await screen.findByText("てすとこめんと");
    await waitFor(() => {
      expect(commentEl).toBeInTheDocument();
    });
  });
});
