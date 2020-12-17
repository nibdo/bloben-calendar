
const password = (state: any = '', action: any) => {
    switch (action.type) {
        case 'SET_PASSWORD':
            return action.payload;
        default:
            return state;
    }
}

export default password;
