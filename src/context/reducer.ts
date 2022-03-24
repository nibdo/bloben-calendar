// tslint:disable-next-line:cyclomatic-complexity
const Reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'isLogged':
      return {
        ...state,
        isLogged: action.payload,
      };
    case 'isMobile':
      return {
        ...state,
        isMobile: action.payload,
      };
    case 'latestVersion':
      return {
        ...state,
        latestVersion: action.payload,
      };
    case 'debugging':
      return {
        ...state,
        debugging: action.payload,
      };
    case 'emailConfig':
      return {
        ...state,
        emailConfig: action.payload,
      };
    case 'syncSequence':
      return {
        ...state,
        syncSequence: action.payload,
      };
    case 'errorObj':
      return {
        ...state,
        errorObj: action.payload,
      };
    case 'isAppStarting':
      return {
        ...state,
        isAppStarting: action.payload,
      };
    case 'isLoading':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'isSyncing':
      return {
        ...state,
        isSyncing: action.payload,
      };
    case 'settingsOpen':
      return {
        ...state,
        settingsOpen: action.payload,
      };
    case 'showSnackbar':
      return {
        ...state,
        snackbarIsVisible: true,
        snackbar: action.payload,
      };
    case 'version':
      return {
        ...state,
        version: action.payload,
      };
    case 'isDark':
      return {
        ...state,
        isDark: action.payload,
      };
    default:
      return state;
  }
};

export default Reducer;
