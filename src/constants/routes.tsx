export const PATH_HOME = '/';

export const PATH_HYPOTHESES = '/hypotheses';
export const PATH_HYPOTHESIS_NEW = '/hypotheses/new';
export const PATH_HYPOTHESIS_ID = '/hypotheses/:hypothesisId';
export const PATH_HYPOTHESIS_ID_RE = new RegExp(/\/hypotheses\/([\w-]{8,36})$/);
export const PATH_HYPOTHESIS_ID_EDIT = '/hypotheses/:hypothesisId/edit';
export const PATH_HYPOTHESIS_ID_EDIT_RE = new RegExp(/\/hypotheses\/([\w-]{8,36})\/edit$/);

export const PATH_LOIS = '/lois';
export const PATH_LOI_NEW = '/lois/new';
