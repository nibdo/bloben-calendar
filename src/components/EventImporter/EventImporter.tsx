import React, { useEffect, useRef, useState } from 'react';
import './EventImporter.scss';
import '../calendar-settings/calendar-settings.scss'
import { ButtonBase } from '@material-ui/core';
import EventUploader from '../../utils/EventUploader';
import IcsParser from '../../utils/IcsParser';
import { useDispatch, useSelector } from 'react-redux';
import { useCurrentHeight } from '../../bloben-common/utils/layout';
import { renderAgendaEvents } from '../calendar-view/agenda/agenda';
import EventStateEntity, { EventBodyToSend } from '../../data/entities/state/event.entity';
import { cloneDeep, findInArrayById, mapEventsToDates } from '../../utils/common';
import Modal from '../../bloben-package/components/modal';
import HeaderModal from '../header-modal';
import { PgpKeys } from '../../bloben-package/utils/OpenPgp';
import { mergeEvent } from '../../redux/actions';
import {
    sendWebsocketMessage,
    WEBSOCKET_CREATE_EVENT, WEBSOCKET_IMPORT_EVENTS
} from '../../api/calendar';
import { Calendar } from '../event/event-detail/event-detail';
import { useHistory } from 'react-router-dom';

const Results = (props: any) => {
    const { results, } = props;
    const isDark: boolean = useSelector((state: any) => state.isDark);
    const height: number = useCurrentHeight() - 56;

    const emptyFunc: any = () => {};

    const renderedResults: any = renderAgendaEvents(results, isDark, emptyFunc, emptyFunc, true);

    return <div className={'search__container-results'} style={{height, width: '100%'}}>{renderedResults}</div>;
};

const ImportedEvents = (props: any) => {
    const {data, handleSave, clearData, calendar, changeCalendar, coordinates, setCoordinates} = props;

    return <Modal>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
        <HeaderModal title={'Import events'} handleSave={handleSave} onClose={clearData}/>
            <Calendar
                calendar={calendar}
                setForm={changeCalendar}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
            />
        <Results results={data}/>
        </div>
    </Modal>
}

const EventImporter = (props: any) => {
    const {handleImportClick} = props;
    const cryptoPassword: any = useSelector((state: any) => state.cryptoPassword);
    const pgpKeys: PgpKeys = useSelector((state: any) => state.pgpKeys);
    const history: any = useHistory()
    const inputFile = useRef(null);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [data, setData] = useState(null);
    const calendars: any = useSelector((state: any) => state.calendars);
    const isDark: boolean = useSelector((state: any) => state.isDark);
    const [coordinates, setCoordinates] = useState({x: 0, y: 0});
    const dispatch: any = useDispatch();
    const [calendar, setCalendar] = useState(null)

    const handleSave = async () => {
        const body: any = [];

        if (data) {
            // @ts-ignore
            for (const [key, value] of Object.entries(data)) {
                for (const item of value as any) {
                    // Encrypt data
                    const bodyToSend: EventBodyToSend = pgpKeys && pgpKeys.publicKey
                        ? await item.formatBodyToSendOpenPgp(pgpKeys)
                        : await item.formatBodyToSend(cryptoPassword);

                    const simpleObj: EventStateEntity = item.getReduxStateObj();

                    // Save to redux store
                    // dispatch(mergeEvent(simpleObj));

                    body.push(bodyToSend);

                }
            }
        }

        sendWebsocketMessage(WEBSOCKET_IMPORT_EVENTS, body);
        history.goBack()
    }

    /**
     * Simulate click to hidden input
     */
    const handleInputClick = (e: any) => {

        e.stopPropagation()

        // e.preventDefault()
        // @ts-ignore
        inputFile.current.click();

    };

    /**
     * Validate file type
     * @param fileObj
     */
    const validateFile = (fileObj: any): boolean => {
        const {name, size, type} = fileObj;

        const fileExtension: string = name.split('.').pop();

        if (fileExtension !== 'ics') {
            return false;
        }

        if (size > 30000000) {
            return false;
        }

        if (type !== 'text/calendar') {
            return false;
        }

        return true;
    }

    /**
     * Handle file select
     * @param event
     */
    const onFileChange = (event: any) => {
        if (event.target.files && event.target.files.length > 0) {
            // Select file
            const fileFromInput: any = event.target.files[0]
            const reader: FileReader = new FileReader();
            if (fileFromInput) {

                // Validate file
                const isValidFile: boolean = validateFile(fileFromInput);

                if (!isValidFile) {
                    return;
                }

                // Read file content
                reader.readAsText(fileFromInput, 'UTF-8');
                reader.onload =  (evt: any) => {
                    const readerResult: any = evt.target.result;
                    setFile(readerResult);

                    // Parse string ics events to obj
                    const parsedEvents: any = IcsParser.parseFile(readerResult)

                    const enhancedEvents: any = IcsParser.enhanceParsedEvent(parsedEvents, calendar)

                    const result: any = mapEventsToDates(enhancedEvents);

                    setData(result)
                }
            } else {
                clearData()
            }
        }
    };

    const changeCalendar = async (itemName: string, calendarId: string) => {
        const calendarSelected: any = await findInArrayById(calendars, calendarId)

        setCalendar(calendarSelected)

        // @ts-ignore
        const result: any = cloneDeep(data);

        for (const [key, value] of Object.entries(data as any)) {
            for (const item of value as any) {
                item.calendarId = calendarId;
                item.color = calendarSelected.color;
            }
        }

        setData(result)
    }

    const clearData = () => {
        setData(null)
        history.goBack()
    }

    /**
     * Handle new file selected
     */
    useEffect(() => {
        if (!file) {
            return;
        }
    },        [file])

    /**
     * Click listener to set coordinates for dropdowns
     * @param e
     */
    const handleNewCoordinates = (e: any) => {
        const rect: any = e.target.getBoundingClientRect();
        setCoordinates({x: rect.x, y: rect.y});
    }

    useEffect(() => {
        if (props.autoFocus) {
            // @ts-ignore
            inputFile.current.click();
        }

        setCalendar(calendars[0])
        document.addEventListener('click', handleNewCoordinates)

        return () => {
            document.removeEventListener('click', handleNewCoordinates)
        }
    },        [])

    return data
            ? <ImportedEvents
            data={data}
            handleSave={handleSave}
            clearData={clearData}
            changeCalendar={changeCalendar}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            calendar={calendar}
        />
            : <ButtonBase
            className={'calendar-settings__item-container'}
            onClick={handleInputClick}
            >
            <p
                className={`calendar-settings__item-text${isDark ? '-dark' : ''}`}
            >
                Import events
            </p>
                <input
                    className={'event_uploader__input'}
                    type='file'
                    id='file'
                    ref={inputFile}
                    accept={'.ics'}
                    // autoFocus={true}
                    onChange={onFileChange}
                />
            </ButtonBase>
};

export default EventImporter;
