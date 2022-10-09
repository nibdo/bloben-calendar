import { GetProfileResponse } from '../../bloben-interface';
import { ROLE } from '../../enums';

const user = (
  state: GetProfileResponse = {
    username: '',
    id: '',
    isTwoFactorEnabled: false,
    role: ROLE.DEMO,
    language: 'en',
  },
  action: any
) => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    default:
      return state;
  }
};

export default user;
