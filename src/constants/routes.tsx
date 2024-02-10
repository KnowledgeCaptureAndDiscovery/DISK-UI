export const PATH_HOME = '/';

export const PATH_GOALS = '/goals';
export const PATH_MY_GOALS = '/my-goals';
export const PATH_GOAL_NEW = '/goals/new';
export const PATH_GOAL_ID = '/goals/:goalId';
export const PATH_GOAL_ID_RE = new RegExp(/\/goals\/([\w-]{8,36})$/);
export const PATH_GOAL_ID_EDIT = '/goals/:goalId/edit';
export const PATH_GOAL_ID_EDIT_RE = new RegExp(/\/goals\/([\w-]{8,36})\/edit$/);

export const PATH_HYP_QUESTIONS = '/questions/goals';
export const PATH_LOI_QUESTIONS = '/questions/lois';

export const PATH_LOIS = '/lois';
export const PATH_MY_LOIS = '/my-lois';
export const PATH_LOI_NEW = '/lois/new';
export const PATH_LOI_ID = '/lois/:loiId';
export const PATH_LOI_ID_RE = new RegExp(/\/lois\/([\w-]{8,36})$/);
export const PATH_LOI_ID_EDIT = '/lois/:loiId/edit';
export const PATH_LOI_ID_EDIT_RE = new RegExp(/\/lois\/([\w-]{8,36})\/edit$/);

export const PATH_TLOIS = '/tlois';
export const PATH_TLOI_ID = '/tlois/:tloiId';
export const PATH_TLOI_ID_RE = new RegExp(/\/tlois\/([\w-]{8,36})$/);

export const PATH_TERMINOLOGY = '/terminology';
export const PATH_DATA = '/data';