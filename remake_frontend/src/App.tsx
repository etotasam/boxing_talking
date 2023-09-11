// import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// ! page
import { Home } from "@/page/Home";
import { Match } from "@/page/Match";
import { Admin } from "@/page/Admin";
import { BoxerRegister } from "@/page/Admin/BoxerRegister";
import { BoxerEdit } from "@/page/Admin/BoxerEdit";
import { MatchRegister } from "@/page/Admin/MatchRegister";
import { MatchEdit } from "@/page/Admin/MatchEdit";
// ! middleware
import AdminOnly from "./middleware/AdminOnly";
import Container from "./middleware/Container";
import "./App.css";
//! layout
import MainLayout from "@/layout/MainLayout";
// import AdminiLayout from "@/layout/AdminiLayout";

import { TestModule } from "./components/module/TestModule";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/match" element={<Match />} />
            {/* //? </MainLayout> */}
          </Route>
          <Route element={<AdminOnly />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/boxer_register" element={<BoxerRegister />} />
            <Route path="/admin/boxer_edit" element={<BoxerEdit />} />
            <Route path="/admin/match_register" element={<MatchRegister />} />
            <Route path="/admin/match_edit" element={<MatchEdit />} />
            {/* //? </AdminOnly> */}
          </Route>
          {/* //? </container> */}
        </Route>
        {/* //! テスト用 */}
        <Route element={<MainLayout />}>
          <Route path="/test_module" element={<TestModule />} />
          {/* //? </MainLayout> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
