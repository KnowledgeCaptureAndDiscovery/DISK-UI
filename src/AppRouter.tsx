import RightMenu from "components/RightMenu";
import { PATH_HOME, PATH_HYPOTHESES, PATH_HYPOTHESIS_ID, PATH_HYPOTHESIS_ID_EDIT, PATH_HYPOTHESIS_NEW, PATH_LOIS } from "constants/routes";
import { Home } from "pages/Home";
import { Hypotheses } from "pages/Hypotheses";
import { HypothesisEditor } from "pages/HypothesisEditor";
import { HypothesisView } from "pages/HypothesisView";
import { LinesOfInquiry } from "pages/LOIs";
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

          <Route path={PATH_HYPOTHESIS_NEW} element={<HypothesisEditor/>}></Route>
          <Route path={PATH_HYPOTHESIS_ID} element={<HypothesisView/>}></Route>
          <Route path={PATH_HYPOTHESIS_ID_EDIT} element={<HypothesisEditor/>}></Route>
        </Routes>
      </RightMenu>
    </BrowserRouter>
  );
}
