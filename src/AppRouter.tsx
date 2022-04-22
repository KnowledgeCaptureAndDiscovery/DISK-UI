import RightMenu from "components/RightMenu";
import { PATH_HOME, PATH_HYPOTHESES, PATH_LOIS } from "constants/routes";
import { Home } from "pages/home";
import { Hypotheses } from "pages/hypotheses";
import { LinesOfInquiry } from "pages/lois";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export const AppRouter = () => {
  //const { initialized } = useKeycloak();
  return (
    <BrowserRouter>
      <RightMenu>
        <Routes>
          <Route path={PATH_HOME} element={<Home/>}></Route>
          <Route path={PATH_HYPOTHESES} element={<Hypotheses/>}></Route>
          <Route path={PATH_LOIS} element={<LinesOfInquiry/>}></Route>
        </Routes>
      </RightMenu>
    </BrowserRouter>
  );
}
