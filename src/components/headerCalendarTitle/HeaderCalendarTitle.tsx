import React, { useContext } from 'react';
import { parseCssDark } from '../../bloben-common/utils/common';
import { Context } from '../../bloben-package/context/store';

interface IHeaderCalendarTitleProps {
    title: string;
}
/**
 * Calendar title in header in month date format
 * @param props
 * @constructor
 */
const HeaderCalendarTitle = (props: IHeaderCalendarTitleProps) => {
    const {title} = props;

    const [store] = useContext(Context);
    const { isDark } = store;

    return   <div className={`header__title-button`}>
        <p className={parseCssDark('header__title', isDark)}>
            {title}
        </p>
    </div>
}

export default HeaderCalendarTitle;
