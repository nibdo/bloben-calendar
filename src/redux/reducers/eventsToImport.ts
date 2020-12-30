const eventsToImport = (state: string = '', action: any) => {
    switch (action.type) {
        case 'SET_EVENTS_TO_IMPORT':
            return action.payload;
        default:
            return state;
    }
}

export default eventsToImport;
