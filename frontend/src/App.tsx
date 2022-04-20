import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Check } from "@/pages/check";
import { Home } from "@/pages/Home/Home";
import { Match } from "@/pages/Match";
import { MatchRegister } from "@/pages/MatchRegister";
import { FighterRegister } from "@/pages/FighterRegister";
import { FighterEdit } from "@/pages/FighterEdit";
import { MatchEdit } from "@/pages/MatchEdit";
import { Edit } from "@/pages/Edit";
import { NotFound } from "@/pages/NotFound";
import PrivateRoute from "./middleware/PrivateRoute";
import AuthCheckOnly from "./middleware/AuthCheckOnly";
import AllComponentWrapper from "./middleware/AllComponent";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AllComponentWrapper />}>
          <Route element={<AuthCheckOnly />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/match" element={<Match />} />
          </Route>

          <Route path="/check" element={<Check />} />

          {/* <Route path="/edit" element={<Edit />} /> */}
          <Route path="/fighter/register" element={<FighterRegister />} />
          <Route path="/fighter/edit" element={<FighterEdit />} />
          {/* <Route path="/edit/match" element={<MatchEdit />} /> */}
          <Route path="/match/delete" element={<MatchEdit />} />
          <Route path="/match/register" element={<MatchRegister />} />

          <Route path="/*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
