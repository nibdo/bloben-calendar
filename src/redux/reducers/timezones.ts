
const timezones = (state: any = [], action: any) => {
    switch (action.type) {
        case 'SET_TIMEZONES':
            return action.payload;
        default:
            return state;
    }
}

export default timezones;
