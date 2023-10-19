// import { useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/RoutePath';
// ! page
import { Home } from '@/page/Home';
import { Match } from '@/page/Match';
import { Admin } from '@/page/Admin';
import { BoxerRegister } from '@/page/Admin/BoxerRegister';
import { BoxerEdit } from '@/page/Admin/BoxerEdit';
import { MatchRegister } from '@/page/Admin/MatchRegister';
import { MatchEdit } from '@/page/Admin/MatchEdit';
import { Terms } from './page/Terms/Terms';
import { Identification } from '@/page/Identification';
import { NotFound } from '@/page/NotFound';
import { PastMatches } from './page/PastMatches';
import { TestPage } from './page/TestPage';
// ! middleware
import AdminOnly from './middleware/AdminOnly';
import Container from './middleware/Container';
import './App.css';
//! layout
import HeaderOnlyLayout from '@/layout/HeaderOnlyLayout';
import HeaderAndFooterLayout from '@/layout/HeaderAndFooterLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route element={<HeaderAndFooterLayout />}>
            <Route path={ROUTE_PATH.Home} element={<Home />} />
            <Route path={ROUTE_PATH.PastMatches} element={<PastMatches />} />
            {/* //? </HeaderAndFooterLayout> */}
          </Route>
          <Route element={<HeaderOnlyLayout />}>
            <Route path={ROUTE_PATH.Match} element={<Match />} />
            {/* //? </HeaderOnlyLayout> */}
          </Route>
          <Route element={<AdminOnly />}>
            <Route path={ROUTE_PATH.Admin} element={<Admin />} />
            <Route path={ROUTE_PATH.BoxerEdit} element={<BoxerEdit />} />
            <Route
              path={ROUTE_PATH.BoxerRegister}
              element={<BoxerRegister />}
            />
            <Route path={ROUTE_PATH.MatchEdit} element={<MatchEdit />} />
            <Route
              path={ROUTE_PATH.MatchRegister}
              element={<MatchRegister />}
            />
            {/* //? </AdminOnly> */}
          </Route>
          {/* //? </container> */}
        </Route>

        <Route element={<HeaderOnlyLayout />}>
          {/* <Route path="/test_module" element={<TestModule />} /> */}
          <Route
            path={ROUTE_PATH.Identification}
            element={<Identification />}
          />
          {/* //? </HeaderOnlyLayout> */}
        </Route>

        <Route element={<HeaderAndFooterLayout />}>
          <Route path={ROUTE_PATH.Terms} element={<Terms />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/*" element={<NotFound />} />
          {/* //? </HeaderAndFooterLayout> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
