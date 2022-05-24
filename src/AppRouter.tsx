import RightMenu from "components/RightMenu";
import { PATH_HOME, PATH_HYPOTHESES, PATH_HYPOTHESIS_ID, PATH_HYPOTHESIS_ID_EDIT, PATH_HYPOTHESIS_NEW, PATH_LOIS, PATH_LOI_ID, PATH_LOI_ID_EDIT, PATH_LOI_NEW } from "constants/routes";
import Home from "pages/Home";
import { Hypotheses } from "pages/Hypothesis/Hypotheses";
import { HypothesisEditor } from "pages/Hypothesis/HypothesisEditor";
import { HypothesisView } from "pages/Hypothesis/HypothesisView";
import { LOIEditor } from "pages/LOI/LOIEditor";
import { LinesOfInquiry } from "pages/LOI/LOIs";
import { LOIView } from "pages/LOI/LOIView";
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

          <Route path={PATH_LOI_NEW} element={<LOIEditor/>}></Route>
          <Route path={PATH_LOI_ID} element={<LOIView/>}></Route>
          <Route path={PATH_LOI_ID_EDIT} element={<LOIEditor/>}></Route>
        </Routes>
      </RightMenu>
    </BrowserRouter>
  );
}
