// import { useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
            <Route path="/" element={<Home />} />
            <Route path="/past_matches" element={<PastMatches />} />
            {/* //? </HeaderAndFooterLayout> */}
          </Route>
          <Route element={<HeaderOnlyLayout />}>
            <Route path="/match" element={<Match />} />
            {/* //? </HeaderOnlyLayout> */}
          </Route>
          <Route element={<AdminOnly />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/boxer_edit" element={<BoxerEdit />} />
            <Route path="/admin/boxer_register" element={<BoxerRegister />} />
            <Route path="/admin/match_register" element={<MatchRegister />} />
            <Route path="/admin/match_edit" element={<MatchEdit />} />
            {/* //? </AdminOnly> */}
          </Route>
          {/* //? </container> */}
        </Route>

        <Route element={<HeaderOnlyLayout />}>
          {/* <Route path="/test_module" element={<TestModule />} /> */}
          <Route path="/identification" element={<Identification />} />
          {/* //? </HeaderOnlyLayout> */}
        </Route>

        <Route element={<HeaderAndFooterLayout />}>
          <Route path="/terms" element={<Terms />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/*" element={<NotFound />} />
          {/* //? </HeaderAndFooterLayout> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
