export const setPgpKeys = (pgpKeys: any) => {
    return {
        type: 'SET_PGP_KEYS',
        payload: pgpKeys
    }
}
export const setPassword = (password: string) => {
    return {
        type: 'SET_PASSWORD',
        payload: password
    }
}
export const addWeek = (rangeFromInit: Date) => {
    return {
        type: 'ADD_WEEK'
    }
}
export const subWeek = () => {
    return {
        type: 'SUB_WEEK'
    }
}

export const setRangeFrom = (d: Date) => {
    return {
        type: 'SET_RANGE_FROM',
        payload: d,
    }
}

export const setRangeTo = (d: Date) => {
    return {
        type: 'SET_RANGE_TO',
        payload: d,
    }
}

export const setCalendarDays = (days: any) => {
    return {
        type: 'SET_CALENDAR_DAYS',
        payload: days,
    }
}
export const setCalendarDaysCurrentIndex = (index: number) => {
    return {
        type: 'SET_CALENDAR_DAYS_CURRENT_INDEX',
        payload: index,
    }
}
export const setCryptoPassword = (password: any) => {
    return {
        type: 'SET_CRYPTO_PASSWORD',
        payload: password,
    }
}
export const addCalendar = (data: any) => {
    return {
        type: 'ADD_CALENDAR',
        payload: data,
    }
}
export const updateCalendar = (data: any) => {
    return {
        type: 'UPDATE_CALENDAR',
        payload: data,
    }
}
export const setCalendars = (data: any) => {
    return {
        type: 'SET_CALENDARS',
        payload: data,
    }
}
export const setEvents = (data: any) => {
    return {
        type: 'SET_EVENTS',
        payload: data,
    }
}
export const addEvents = (data: any) => {
    return {
        type: 'ADD_EVENTS',
        payload: data,
    }
}
export const mergeEvent = (data: any) => {
    return {
        type: 'MERGE_EVENT',
        payload: data,
    }
}
export const setEventsLastSync = (data: any) => {
    return {
        type: 'SET_EVENTS_LAST_SYNC',
        payload: data,
    }
}
export const setAllEvents = (data: any) => {
    return {
        type: 'SET_ALL_EVENTS',
        payload: data,
    }
}
export const setIsFirstLogin = (data: any) => {
    return {
        type: 'SET_IS_FIRST_LOGIN',
        payload: data,
    }
}
export const setCalendarView = (data: any) => {
    return {
        type: 'SET_CALENDAR_VIEW',
        payload: data,
    }
}

export const selectEvent = (data: any) => {
    return {
        type: 'SELECT_EVENT',
        payload: data,
    }
}
export const clearSelectedEvent = () => {
    return {
        type: 'CLEAR_SELECTED_EVENT',
    }
}

export const setIsDark = (data: any) => {
    return {
        type: 'SET_IS_DARK',
        payload: data,
    }
}

export const setIsMobile = (data: any) => {
    return {
        type: 'SET_IS_MOBILE',
        payload: data,
    }
}

export const setIsLogged = (data: any) => {
    return {
        type: 'SET_IS_LOGGED',
        payload: data,
    }
}
export const setUsername = (data: any) => {
    return {
        type: 'SET_USERNAME',
        payload: data,
    }
}
export const setIsLoading = (data: any) => {
    return {
        type: 'SET_IS_LOADING',
        payload: data,
    }
}
export const setIsAppStarting = (data: any) => {
    return {
        type: 'SET_IS_APP_STARTING',
        payload: data,
    }
}

export const setPasswords = (data: any) => {
    return {
        type: 'SET_PASSWORDS',
        payload: data,
    }
}
export const addPassword = (data: any) => {
    return {
        type: 'ADD_PASSWORD',
        payload: data,
    }
}
export const setNotifications = (data: any) => {
    return {
        type: 'SET_NOTIFICATIONS',
        payload: data,
    }
}
export const addNotification = (data: any) => {
    return {
        type: 'ADD_NOTIFICATION',
        payload: data,
    }
}
export const setSelectedDate = (data: any) => {
    return {
        type: 'SET_SELECTED_DATE',
        payload: data,
    }
}
export const setEventsAreFetching = (data: any) => {
    return {
        type: 'SET_EVENTS_ARE_FETCHING',
        payload: data,
    }
}
export const setCalendarBodyWidth = (data: any) => {
    return {
        type: 'SET_CALENDAR_BODY_WIDTH',
        payload: data,
    }
}
export const setCalendarBodyHeight = (data: any) => {
    return {
        type: 'SET_CALENDAR_BODY_HEIGHT',
        payload: data,
    }
}
