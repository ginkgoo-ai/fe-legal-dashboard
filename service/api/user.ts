import { UserInfo, UserParams } from "@/types/user";
import ApiRequest from "../axios";

const UserApi = {
  userinfo: "/identity/users/me",
  updateUserInfo: "/identity/users/{id}",
};

const getUserInfo = async () => {
  return ApiRequest.get<UserInfo>(UserApi.userinfo);
};

const updateUserInfo = async (id: string, data: UserParams): Promise<UserInfo> => {
  return ApiRequest.patch<UserInfo>(UserApi.updateUserInfo.replace("{id}", id), data);
};

export { getUserInfo, updateUserInfo };
