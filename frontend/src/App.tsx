import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import { Login } from "./pages/login";
import { Comments } from "./pages/comments";
import { FightSetting } from "./pages/fight_setting";
import NotFound from "./components/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import AuthCheckOnly from "./components/AuthCheckOnly";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthCheckOnly />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/comments" element={<Comments />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/fight" element={<FightSetting />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
