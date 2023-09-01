// import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
// ! components
import { Home } from "@/page/Home";
// ! middleware
import Container from "./middleware/Container";
import "./App.css";
//! layout
import MainLayout from "@/layout/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
