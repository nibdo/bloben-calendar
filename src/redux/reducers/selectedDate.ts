
const selectedDate = (state: any = null, action: any) => {
    switch (action.type) {
        case 'SET_SELECTED_DATE':
            return action.payload;
        default:
            return state;
    }
}

export default selectedDate;
