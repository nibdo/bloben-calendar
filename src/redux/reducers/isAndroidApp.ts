const isAndroidApp = (state: boolean = false, action: any) => {
    switch (action.type) {
        case 'SET_IS_ANDROID_APP':
            return action.payload;
        default:
            return state;
    }
}

export default isAndroidApp;
