// @ts-ignore
import * as ICAL from 'ical.js';

const EventUploader = {
    parseFromString: (iCalendarData: string) => {
        const jcalData: any = ICAL.parse(iCalendarData);
        const vcalendar: any = new ICAL.Component(jcalData);

    }
};

export default EventUploader;
