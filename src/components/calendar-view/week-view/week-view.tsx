import React from 'react';
import './week-view.scss';

import CalendarHeader from '../../calendar-header/calendar-header';
import CalendarBody from '../../calendar-body/calendar-body';
import Carousel from '../../carousel/carousel';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useCurrentWidth } from '../../../bloben-common/utils/layout';
import { checkIfSwipingForward } from '../calendar-common';
import { useSelector } from 'react-redux';

const WeekViewContainer = (props: any) => {
  const {
    selectedDate,
    daysNum,
    openNewEvent,
    getNewCalendarDays,
  } = props;

  const width: number = useCurrentWidth();
  const isMobile: boolean = useSelector((state: any) => state.isMobile);
  const calendarDaysCurrentIndex: number = useSelector((state: any) => state.calendarDaysCurrentIndex);

  const sliderSettings: any = {
    dots: false,
    touchThreshold: 5,
    infinite: true,
    speed: 250,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange(currentSlide: number, nextSlide: number) {
      const isGoingForward: boolean = checkIfSwipingForward(currentSlide, nextSlide);
      getNewCalendarDays(isGoingForward, nextSlide)
    },
    initialSlide: 1
  }

  return (
      isMobile ?
        <Slider {...sliderSettings}>
            <div style={{ height: '100%', width, display: 'flex'}}>
          <CalendarHeader
              index={0}
              daysNum={daysNum}
              selectedDate={selectedDate}
              hasHeaderEvents={false}
          />
          <CalendarBody
              index={0}
              daysNum={daysNum}
              openNewEvent={openNewEvent}
          />
        </div>
            <div style={{ height: '100%', width, display: 'flex'}}>
          <CalendarHeader
              index={1}
              daysNum={daysNum}
              selectedDate={selectedDate}
              hasHeaderEvents={false}
          />
          <CalendarBody
              index={1}
              daysNum={daysNum}
              openNewEvent={openNewEvent}
          />
        </div>
        <div style={{ height: '100%', width, display: 'flex'}}>
          <CalendarHeader
              index={2}
              daysNum={daysNum}
              selectedDate={selectedDate}
              hasHeaderEvents={false}
          />
          <CalendarBody
              index={2}
              daysNum={daysNum}
              openNewEvent={openNewEvent}
          />
        </div>
      </Slider>
          :    <div style={{ height: '100%', width, }}>
            <CalendarHeader
                index={isMobile ? 1 : calendarDaysCurrentIndex}
                daysNum={daysNum}
                selectedDate={selectedDate}
                hasHeaderEvents={false}
            />
            <CalendarBody
                index={isMobile ? 1 : calendarDaysCurrentIndex}
                daysNum={daysNum}
                openNewEvent={openNewEvent}
            />
          </div>
);
};

const WeekView = (props: any) =>
    <WeekViewContainer {...props} />;

export default WeekView;
