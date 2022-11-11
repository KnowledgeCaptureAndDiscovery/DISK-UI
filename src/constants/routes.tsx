export const PATH_HOME = '/';

export const PATH_HYPOTHESES = '/hypotheses';
export const PATH_MY_HYPOTHESES = '/my-hypotheses';
export const PATH_HYPOTHESIS_NEW = '/hypotheses/new';
export const PATH_HYPOTHESIS_ID = '/hypotheses/:hypothesisId';
export const PATH_HYPOTHESIS_ID_RE = new RegExp(/\/hypotheses\/([\w-]{8,36})$/);
export const PATH_HYPOTHESIS_ID_EDIT = '/hypotheses/:hypothesisId/edit';
export const PATH_HYPOTHESIS_ID_EDIT_RE = new RegExp(/\/hypotheses\/([\w-]{8,36})\/edit$/);

export const PATH_HYP_QUESTIONS = '/questions/hypotheses';
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