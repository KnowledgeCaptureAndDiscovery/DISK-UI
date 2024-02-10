import { Backdrop, Box, CircularProgress } from "@mui/material";
import RightMenu from "components/RightMenu";
import { PATH_DATA, PATH_HOME, PATH_GOALS, PATH_GOAL_ID, PATH_GOAL_ID_EDIT, PATH_GOAL_NEW, PATH_HYP_QUESTIONS, PATH_LOIS, PATH_LOI_ID, PATH_LOI_ID_EDIT, PATH_LOI_NEW, PATH_LOI_QUESTIONS, PATH_MY_GOALS, PATH_MY_LOIS, PATH_TERMINOLOGY, PATH_TLOI_ID } from "constants/routes";
import { Home } from "pages/Home";
import { Goals } from "pages/Goals/Goals";
import { HypothesisEditor } from "pages/Goals/GoalEditor";
import { HypothesisView } from "pages/Goals/GoalView";
import { LOIEditor } from "pages/LOI/LOIEditor";
import { LinesOfInquiry } from "pages/LOI/LOIs";
import { LOIView } from "pages/LOI/LOIView";
import { TerminologyView } from "pages/Terminology/TerminologyView";
import { DataView } from "pages/Data/DataView";
import { TLOIView } from "pages/TLOI/TLOIView";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuthenticated, useBackdrop } from "redux/hooks";
import { HypothesisQuestion } from "pages/Questions/HypothesisQuestions";
import { LOIQuestion } from "pages/Questions/LOIQuestion";
import { Notification } from "components/Notification";

const notAuthMsg = () => {
  return (<Box sx={{display: 'flex', width: "100%", alignItems: 'center', justifyContent: 'center', height: "75vh", fontSize: "1.2em", color: "#777"}}>
    Unauthorized. You must log in to see this page.
  </Box>)
}

export const AppRouter = () => {
  const authenticated = useAuthenticated();
  const backdropOpen = useBackdrop();

  return (
    <BrowserRouter>
      <Notification/>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <RightMenu>
        <Routes>
          <Route path={PATH_HOME} element={<Home/>}></Route>
          <Route path={PATH_GOALS} element={<Goals/>}></Route>
          <Route path={PATH_LOIS} element={<LinesOfInquiry/>}></Route>

          <Route path={PATH_HYP_QUESTIONS} element={<HypothesisQuestion/>}></Route>
          <Route path={PATH_LOI_QUESTIONS} element={<LOIQuestion/>}></Route>

          <Route path={PATH_MY_GOALS} element={<Goals myPage={true}/>}></Route>
          <Route path={PATH_MY_LOIS} element={<LinesOfInquiry myPage={true}/>}></Route>

          <Route path={PATH_GOAL_NEW} element={authenticated ? <HypothesisEditor/> : notAuthMsg() }></Route>
          <Route path={PATH_GOAL_ID} element={<HypothesisView/>}></Route>
          <Route path={PATH_GOAL_ID_EDIT} element={authenticated ? <HypothesisEditor/> : notAuthMsg()}></Route>

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
