import { AxiosResponse } from 'axios';
import {
  CommonResponse,
  CreateCalDavEventRequest,
  DeleteCalDavEventRequest,
  DeleteRepeatedCalDavEventRequest,
  DuplicateMultipleCalDavEventsBody,
  GetCaldavEventResponse,
  UpdateCalDavEventRequest,
  UpdatePartstatStatusRequest,
  UpdateRepeatedCalDavEventRequest,
} from '../bloben-interface';
import Axios from '../lib/Axios';

export default {
  createEvent: async (
    data: CreateCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/caldav-events/`, data);
  },
  updateEvent: async (
    data: UpdateCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/app/v1/caldav-events/`, data);
  },
  deleteEvent: async (
    data: DeleteCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/caldav-events/`, data);
  },
  getEvent: async (
    calendarID: string,
    url: string
  ): Promise<AxiosResponse<GetCaldavEventResponse>> => {
    return Axios.get(
      `/app/v1/caldav-events?calendarID=${calendarID}&url=${url}`
    );
  },
  updateRepeatedEvent: async (
    data: UpdateRepeatedCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.put(`/app/v1/caldav-events/repeated`, data);
  },
  deleteRepeatedEvent: async (
    data: DeleteRepeatedCalDavEventRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.delete(`/app/v1/caldav-events/repeated`, data);
  },
  updateStatus: async (
    id: string,
    data: UpdatePartstatStatusRequest
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.patch(`/app/v1/caldav-events/${id}`, data);
  },
  duplicateMultiple: async (
    id: string,
    data: DuplicateMultipleCalDavEventsBody
  ): Promise<AxiosResponse<CommonResponse>> => {
    return Axios.post(`/app/v1/caldav-events/${id}/duplicate`, data);
  },
};
