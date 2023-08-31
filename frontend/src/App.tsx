import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Check } from "@/pages/check";
import { Match } from "@/pages/Match";
import { Home } from "@/pages/Home";
import { MatchRegister } from "@/pages/MatchRegister";
import { FighterRegister } from "@/pages/FighterRegister";
import { FighterEdit } from "@/pages/FighterEdit";
import { MatchEdit } from "@/pages/MatchEdit";
// import { Edit } from "@/pages/Edit";
// import { Test } from "@/pages/Test";
// import { Test2 } from "@/pages/Test2";
import { UserRegisterwidthVerifyEmail } from "@/pages/UserRegisterwidthVerifyEmail";
import { NotFound } from "@/pages/NotFound";
//! middleware
// import PrivateRoute from "./middleware/PrivateRoute";
import AdminOnly from "./middleware/AdminOnly";
import Container from "./middleware/Container";
//! layout
import MainLayout from "@/layout/MainLayout";
import LayoutPlain from "./layout/LayoutPlain";
//! lazy component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* <Route element={<PrivateRoute />}></Route> */}
            <Route path="/match" element={<Match />} />
          </Route>

          <Route element={<AdminOnly />}>
            {/* <Route path="/edit" element={<Edit />} /> */}
            <Route path="/fighter/register" element={<FighterRegister />} />
            <Route path="/fighter/edit" element={<FighterEdit />} />
            <Route path="/match/delete" element={<MatchEdit />} />
            <Route path="/match/register" element={<MatchRegister />} />
          </Route>
        </Route>

        <Route path="/check" element={<Check />} />
        {/* <Route path="/test" element={<Test />} />
        <Route path="/test2" element={<Test2 />} /> */}
        <Route path="/register/:token/:id" element={<UserRegisterwidthVerifyEmail />} />
        <Route element={<LayoutPlain />}>
          <Route path="/*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
