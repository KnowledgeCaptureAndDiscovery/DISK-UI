import { Box } from "@mui/material";
import RightMenu from "components/RightMenu";
import { PATH_DATA, PATH_HOME, PATH_HYPOTHESES, PATH_HYPOTHESIS_ID, PATH_HYPOTHESIS_ID_EDIT, PATH_HYPOTHESIS_NEW, PATH_LOIS, PATH_LOI_ID, PATH_LOI_ID_EDIT, PATH_LOI_NEW, PATH_MY_HYPOTHESES, PATH_MY_LOIS, PATH_QUESTIONS, PATH_TERMINOLOGY, PATH_TLOI_ID } from "constants/routes";
import { Home } from "pages/Home";
import { Hypotheses } from "pages/Hypothesis/Hypotheses";
import { HypothesisEditor } from "pages/Hypothesis/HypothesisEditor";
import { HypothesisView } from "pages/Hypothesis/HypothesisView";
import { LOIEditor } from "pages/LOI/LOIEditor";
import { LinesOfInquiry } from "pages/LOI/LOIs";
import { LOIView } from "pages/LOI/LOIView";
import { TerminologyView } from "pages/Terminology/TerminologyView";
import { DataView } from "pages/Data/DataView";
import { TLOIView } from "pages/TLOI/TLOIView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAppSelector } from "redux/hooks";
import { RootState } from "redux/store";
import { QuestionsPage } from "pages/Questions";
import { useKeycloak } from "@react-keycloak/web";

const notAuthMsg = () => {
  return (<Box sx={{display: 'flex', width: "100%", alignItems: 'center', justifyContent: 'center', height: "75vh", fontSize: "1.2em", color: "#777"}}>
    Unauthorized. You must log in to see this page.
  </Box>)
}

export const AppRouter = () => {
  const authenticated = useAppSelector((state:RootState) => state.keycloak.authenticated);
  const {initialized} = useKeycloak();
  if (!initialized) return <div>Loading...</div>;
  return (
    <BrowserRouter>
      <RightMenu>
        <Routes>
          <Route path={PATH_HOME} element={<Home/>}></Route>
          <Route path={PATH_HYPOTHESES} element={<Hypotheses/>}></Route>
          <Route path={PATH_LOIS} element={<LinesOfInquiry/>}></Route>
          <Route path={PATH_QUESTIONS} element={<QuestionsPage/>}></Route>

          <Route path={PATH_MY_HYPOTHESES} element={<Hypotheses myPage={true}/>}></Route>
          <Route path={PATH_MY_LOIS} element={<LinesOfInquiry myPage={true}/>}></Route>

          <Route path={PATH_HYPOTHESIS_NEW} element={authenticated ? <HypothesisEditor/> : notAuthMsg() }></Route>
          <Route path={PATH_HYPOTHESIS_ID} element={<HypothesisView/>}></Route>
          <Route path={PATH_HYPOTHESIS_ID_EDIT} element={authenticated ? <HypothesisEditor/> : notAuthMsg()}></Route>

          <Route path={PATH_LOI_NEW} element={authenticated ? <LOIEditor/> : notAuthMsg() }></Route>
          <Route path={PATH_LOI_ID} element={<LOIView/>}></Route>
          <Route path={PATH_LOI_ID_EDIT} element={authenticated ? <LOIEditor/> : notAuthMsg() }></Route>

          <Route path={PATH_TLOI_ID} element={<TLOIView/>}></Route>

          <Route path={PATH_TERMINOLOGY} element={<TerminologyView/>}></Route>
          <Route path={PATH_DATA} element={<DataView/>}></Route>
        </Routes>
      </RightMenu>
    </BrowserRouter>
  );
}
