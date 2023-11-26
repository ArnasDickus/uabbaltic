import {
  ICheckEmailApi,
  ICheckUsernameApi,
} from "@/app/[lng]/register/components/interfaces";
import { getBaseUrl } from "@/app/utils/get-base-url";
import { apiRoutes } from "@/constants/routes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: getBaseUrl() }),
  endpoints: (builder) => ({
    checkEmailApi: builder.query<ICheckEmailApi, { email: string }>({
      query: (data) => {
        return {
          url: apiRoutes["check-email"],
          method: "POST",
          body: { ...data },
        };
      },
    }),
    checkUsernameApi: builder.query<ICheckUsernameApi, { username: string }>({
      query: (data) => {
        return {
          url: apiRoutes["check-username"],
          method: "POST",
          body: { ...data },
        };
      },
    }),
  }),
});

export const { useLazyCheckEmailApiQuery, useLazyCheckUsernameApiQuery } =
  authApi;