// import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// ! page
import { Home } from "@/page/Home";
import { Match } from "@/page/Match";
import { Admini } from "@/page/Admini";
import { BoxerRegister } from "@/page/Admini/BoxerRegister";
import { BoxerEdit } from "@/page/Admini/BoxerEdit";
import { MatchRegister } from "@/page/Admini/MatchRegister";
// ! middleware
import Container from "./middleware/Container";
import "./App.css";
//! layout
import MainLayout from "@/layout/MainLayout";
import AdminiLayout from "@/layout/AdminiLayout";

import { TestModule } from "./components/module/TestModule";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            {/* </MainLayout> */}
          </Route>
          {/* //! <adminページ> */}
          <Route path="/admini" element={<Admini />} />
          <Route path="/admini/boxer_register" element={<BoxerRegister />} />
          <Route path="/admini/boxer_edit" element={<BoxerEdit />} />
          <Route path="/admini/match_register" element={<MatchRegister />} />
          {/* //! </adminページ> */}
          {/* </container> */}
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/match" element={<Match />} />
          {/* </MainLayout> */}
        </Route>
        <Route path="/test_module" element={<TestModule />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
