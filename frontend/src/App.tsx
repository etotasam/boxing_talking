import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Comments } from "./pages/comments";
import { FightSetting } from "./pages/fight_setting";
import { Check } from "./pages/check";
import NotFound from "./components/NotFound";
import PrivateRoute from "./middleware/PrivateRoute";
import GetMatches from "@/middleware/GetMatches";
import Middleware1 from "./middleware/Middleware1";
import GuestOnly from "./middleware/GuestOnly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Middleware1 />}>
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<GetMatches />}>
          <Route element={<PrivateRoute />}>
            <Route path="/comments" element={<Comments />} />
          </Route>
        </Route>

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route path="/fight" element={<FightSetting />} />
        <Route path="/check" element={<Check />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
