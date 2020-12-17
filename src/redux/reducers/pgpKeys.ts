const pgpKeys = (state: any = {privateKey: null, publicKey: null}, action: any) => {
    switch (action.type) {
        case 'SET_PGP_KEYS':
            return action.payload;
        default:
            return state;
    }
}

export default pgpKeys;
