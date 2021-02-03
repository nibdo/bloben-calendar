const warning = (state: boolean = true, action: any) => {
    switch (action.type) {
        case 'SET_WARNING':
            return action.payload;
        default:
            return state;
    }
}

export default warning;
