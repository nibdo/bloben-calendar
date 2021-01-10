import React from 'react';
import './WeekView.scss';

import CalendarHeader from '../../calendarHeader/CalendarHeader';
import CalendarBody from '../../calendarBody/CalendarBody';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { WidthHook } from '../../../bloben-common/utils/layout';
import { checkIfSwipingForward } from '../calendar-common';
import { useSelector } from 'react-redux';

interface IWeekViewContainerProps {
    daysNum: number;
    openNewEvent: any;
    getNewCalendarDays: any;
}
const WeekView = (props: IWeekViewContainerProps) => {
  const { daysNum, openNewEvent, getNewCalendarDays } = props;

  const width: number = WidthHook();
  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const calendarDaysCurrentIndex: number = useSelector(
    (state: any) => state.calendarDaysCurrentIndex
  );

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
        <CalendarHeader
          index={0}
          daysNum={daysNum}
        />
        <CalendarBody index={0} daysNum={daysNum} openNewEvent={openNewEvent} />
      </div>
      <div style={{ height: '100%', width, display: 'flex' }}>
        <CalendarHeader
          index={1}
          daysNum={daysNum}
        />
        <CalendarBody index={1} daysNum={daysNum} openNewEvent={openNewEvent} />
      </div>
      <div style={{ height: '100%', width, display: 'flex' }}>
        <CalendarHeader
          index={2}
          daysNum={daysNum}
        />
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
