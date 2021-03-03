import React, { useContext } from 'react';
import './WeekView.scss';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useSelector } from 'react-redux';

import CalendarHeader from '../../calendarHeader/CalendarHeader';
import CalendarBody from '../../calendarBody/CalendarBody';
import { WidthHook } from '../../../bloben-common/utils/layout';
import { checkIfSwipingForward } from '../calendar-common';
import { Context } from '../../../bloben-package/context/store';
import { getNewCalendarDays } from '../../../utils/getCalendarDaysAndEvents';

interface WeekViewContainerProps {
  daysNum: number;
  openNewEvent: any;
}
const WeekView = (props: WeekViewContainerProps) => {
  const { daysNum, openNewEvent } = props;

  const width: number = WidthHook();
  const calendarDaysCurrentIndex: number = useSelector(
    (state: any) => state.calendarDaysCurrentIndex
  );

  const [store] = useContext(Context);
  const { isMobile } = store;

  const sliderSettings: any = {
    dots: false,
    touchThreshold: 5,
    infinite: true,
    speed: 250,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange(currentSlide: number, nextSlide: number) {
      const isGoingForward: boolean = checkIfSwipingForward(
        currentSlide,
        nextSlide
      );
      getNewCalendarDays(isGoingForward, nextSlide);
    },
    initialSlide: 1,
  };

  return isMobile ? (
    <Slider {...sliderSettings}>
      <div style={{ height: '100%', width, display: 'flex' }}>
        <CalendarHeader index={0} daysNum={daysNum} />
        <CalendarBody index={0} daysNum={daysNum} openNewEvent={openNewEvent} />
      </div>
      <div style={{ height: '100%', width, display: 'flex' }}>
        <CalendarHeader index={1} daysNum={daysNum} />
        <CalendarBody index={1} daysNum={daysNum} openNewEvent={openNewEvent} />
      </div>
      <div style={{ height: '100%', width, display: 'flex' }}>
        <CalendarHeader index={2} daysNum={daysNum} />
        <CalendarBody index={2} daysNum={daysNum} openNewEvent={openNewEvent} />
      </div>
    </Slider>
  ) : (
    <div style={{ height: '100%', width }}>
      <CalendarHeader
        index={isMobile ? 1 : calendarDaysCurrentIndex}
        daysNum={daysNum}
      />
      <CalendarBody
        index={isMobile ? 1 : calendarDaysCurrentIndex}
        daysNum={daysNum}
        openNewEvent={openNewEvent}
      />
    </div>
  );
};

export default WeekView;
