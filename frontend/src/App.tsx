// import { useState } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! page
import { Home } from '@/page/Home';
import { Match } from '@/page/Match';
import { PastMatch } from '@/page/PastMatch';

import { BoxerRegister } from '@/page/Admin/BoxerRegister';
import { BoxerEdit } from '@/page/Admin/BoxerEdit';
import { MatchRegister } from '@/page/Admin/MatchRegister';
import { MatchEdit } from '@/page/Admin/MatchEdit';
import { Terms } from './page/Terms';
import { Identification } from '@/page/Identification';
import { NotFound } from '@/page/NotFound';
import { PastMatches } from './page/PastMatches';

import { NewMatch } from './page/NewMatch';
// ! middleware
import AdminOnly from './middleware/AdminOnly';
import Container from './middleware/Container';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Container />}>
          <Route path={ROUTE_PATH.HOME} element={<Home />} />
          <Route path={ROUTE_PATH.PAST_MATCHES} element={<PastMatches />} />
          {/* <Route path={ROUTE_PATH.MATCH} element={<Match />} /> */}
          <Route path={ROUTE_PATH.MATCH} element={<NewMatch />} />
          <Route path={ROUTE_PATH.PAST_MATCH_SINGLE} element={<PastMatch />} />

          <Route element={<AdminOnly />}>
            <Route path={ROUTE_PATH.BOXER_EDIT} element={<BoxerEdit />} />
            <Route path={ROUTE_PATH.BOXER_REGISTER} element={<BoxerRegister />} />
            <Route path={ROUTE_PATH.MATCH_EDIT} element={<MatchEdit />} />
            <Route path={ROUTE_PATH.MATCH_REGISTER} element={<MatchRegister />} />
            {/* //? </AdminOnly> */}
          </Route>
          {/* //? </container> */}
        </Route>

        <Route path={ROUTE_PATH.TERMS} element={<Terms />} />
        <Route path={ROUTE_PATH.IDENTIFICATION} element={<Identification />} />

        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
