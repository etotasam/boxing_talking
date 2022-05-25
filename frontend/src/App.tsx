import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Check } from "@/pages/check";
import { Match } from "@/pages/Match";
import { MatchRegister } from "@/pages/MatchRegister";
import { FighterRegister } from "@/pages/FighterRegister";
import { FighterEdit } from "@/pages/FighterEdit";
import { MatchEdit } from "@/pages/MatchEdit";
import { Edit } from "@/pages/Edit";
import { Test } from "@/pages/Test";
import { NotFound } from "@/pages/NotFound";
import PrivateRoute from "./middleware/PrivateRoute";
import AdminOnly from "./middleware/AdminOnly";
import Container from "./middleware/Container";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route path="/" element={<Home />} />

          <Route element={<PrivateRoute />}></Route>
          <Route path="/match" element={<Match />} />

          <Route path="/*" element={<NotFound />} />

          <Route element={<AdminOnly />}>
            {/* <Route path="/edit" element={<Edit />} /> */}
            <Route path="/fighter/register" element={<FighterRegister />} />
            <Route path="/fighter/edit" element={<FighterEdit />} />
            <Route path="/match/delete" element={<MatchEdit />} />
            <Route path="/match/register" element={<MatchRegister />} />
          </Route>
        </Route>

        <Route path="/check" element={<Check />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
