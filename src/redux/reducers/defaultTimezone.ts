const defaultTimezone = (state: string = '', action: any) => {
    switch (action.type) {
        case 'SET_DEFAULT_TIMEZONE':
            return action.payload;
        default:
            return state;
    }
}

export default defaultTimezone;
