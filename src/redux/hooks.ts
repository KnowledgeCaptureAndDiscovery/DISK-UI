import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { SeverityLevel } from './slices/notifications';
import { BrainFiles } from './brain';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useUser : () => [boolean, string|undefined] = () => [
    useAppSelector((state:RootState) => state.keycloak.authenticated),
    useAppSelector((state:RootState) => state.keycloak.username)
];

export const useAuthenticated = () => useAppSelector((state:RootState) => state.keycloak.authenticated);
export const useUsername = () => useAppSelector((state:RootState) => state.keycloak.username);

export const useBackdrop = () => useAppSelector((state:RootState) => state.backdrop.open);

export const useQuestionBindings = () => useAppSelector((state:RootState) => state.forms.questionBindings);
export const useSelectedQuestion = () => useAppSelector((state:RootState) => state.forms.selectedQuestion);

export const useNotification : () => [boolean, SeverityLevel, string] = () => [
    useAppSelector((state:RootState) => state.notification.open),
    useAppSelector((state:RootState) => state.notification.severity),
    useAppSelector((state:RootState) => state.notification.text)
];

export const useBrainVisualization : () => [boolean, BrainFiles|null, {[id:string]: string}] = () => [
    useAppSelector((state:RootState) => state.brain.loaded),
    useAppSelector((state:RootState) => state.brain.fileList),
    useAppSelector((state:RootState) => state.brain.meshes)
]