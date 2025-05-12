export interface UserRole {
  id: string;
  name: string;
}

export interface UserInfo {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
  roles: UserRole[];
  firstName: string;
  lastName: string;
  /**
   * Whether the user is enabled or not
   **/
  enabled: boolean;
  sub: string;
  fullname?: string;
  logoFileId?: string;
  picture?: string;
}

export type UserParams = {
  firstName?: string;
  lastName?: string;
  pictureUrl?: string;
};
