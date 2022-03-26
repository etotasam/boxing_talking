import { render, screen } from "@testing-library/react";
import { Check } from ".";
import { useSelector } from "react-redux";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { waitFor } from "@testing-library/react";

const server = setupServer(
  rest.get(`http://localhost:8080/api/test`, (req, res, context) => {
    return res(context.status(200), context.json("テストでーす"));
  })
);

jest.mock("react-redux");

let useSelectorMock = useSelector as jest.Mock;
jest.mock("react-router-dom", () => ({
  Link: () => {
    return <a href="./login">テスト</a>;
  },
}));

beforeAll(() => server.listen());

beforeEach(() => {
  server.resetHandlers();
  useSelectorMock.mockReturnValue({ name: "checkのname", id: 100 });
});

afterAll(() => server.close());

describe("check.tsx", () => {
  it("テストのてすと", async () => {
    render(<Check />);
    expect(screen.getByText("loading...")).toBeTruthy();
    const el = await screen.findByText("テストでーす");
    await waitFor(() => {
      expect(el).toBeInTheDocument();
    });
  });
});
