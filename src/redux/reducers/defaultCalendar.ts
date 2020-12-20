const defaultCalendar = (state: string = '', action: any) => {
    switch (action.type) {
        case 'SET_DEFAULT_CALENDAR':
            return action.payload;
        default:
            return state;
    }
}

export default defaultCalendar;
