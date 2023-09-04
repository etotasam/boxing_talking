// import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// ! page
import { Home } from "@/page/Home";
import { Admini } from "@/page/Admini";
import { BoxerRegister } from "@/page/Admini/BoxerRegister";
// ! middleware
import Container from "./middleware/Container";
import "./App.css";
//! layout
import MainLayout from "@/layout/MainLayout";

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
          <Route path="/admini" element={<Admini />} />
          <Route path="/admini/boxer_register" element={<BoxerRegister />} />
          {/* </container> */}
        </Route>
        <Route path="/test_module" element={<TestModule />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
