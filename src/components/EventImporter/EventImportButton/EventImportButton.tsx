import React, { useEffect, useRef, useState } from 'react';
import './EventImportButton.scss';
import '../../calendar-settings/calendar-settings.scss'
import { ButtonBase } from '@material-ui/core';
import IcsParser from '../../../utils/IcsParser';
import { useDispatch, useSelector } from 'react-redux';
import { cloneDeep, findInArrayById, mapEventsToDates } from '../../../utils/common';

import { useHistory } from 'react-router-dom';
import {setEventsToImport} from "../../../redux/actions";

const EventImportButton = (props: any) => {
    const history: any = useHistory()
    const inputFile = useRef(null);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const isDark: boolean = useSelector((state: any) => state.isDark);
    const dispatch: any = useDispatch();

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

                    dispatch(setEventsToImport(readerResult));
                    history.push('/events/import/ics')

                }
            } else {
                // clearData()
            }
        }
    };

    /**
     * Handle new file selected
     */
    useEffect(() => {
        if (!file) {
            return;
        }
    },        [file])

    useEffect(() => {
        if (props.autoFocus) {
            // @ts-ignore
            inputFile.current.click();
        }
    },        [])

    return <ButtonBase
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

export default EventImportButton;
