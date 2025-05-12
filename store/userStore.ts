import { create } from "zustand";
import { UserInfo } from "@/types/user";
import { logger } from "./middleware/logger";

interface UserState {
  userInfo: UserInfo | null;
  setUserInfo: (user: UserInfo | null) => void;
  clearUserInfo: () => void;
}

export const useUserStore = create<UserState>()(
  logger(
    (set) => ({
      userInfo: null,
      setUserInfo: (user) =>
        set({
          userInfo: user
            ? {
                ...user,
                fullname: user ? (user.name ? user.name : `${user?.firstName} ${user?.lastName}`) : "",
              }
            : null,
        }),
      clearUserInfo: () => set({ userInfo: null }),
    }),
    "userStoreLogger"
  )
);
