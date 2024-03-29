import {
  CreateCalDavEventRequest,
  UpdateCalDavEventRequest,
  UpdateRepeatedCalDavEventRequest,
} from 'bloben-interface';
import CalDavEventsApi from '../../../src/api/CalDavEventsApi';

export const mockCalDavEventApi = () => {
  CalDavEventsApi.createEvent = async (data: CreateCalDavEventRequest) => {
    return data as any;
  };
  CalDavEventsApi.updateEvent = async (data: UpdateCalDavEventRequest) => {
    return data as any;
  };
  CalDavEventsApi.updateRepeatedEvent = async (
    data: UpdateRepeatedCalDavEventRequest
  ) => {
    return data as any;
  };
};
