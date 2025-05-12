import ApiRequest from '../axios';

export const OAuth2Api = {
  logout: '/logout',
};

const logout = async () => {
  return ApiRequest.post(OAuth2Api.logout);
};

export { logout };
