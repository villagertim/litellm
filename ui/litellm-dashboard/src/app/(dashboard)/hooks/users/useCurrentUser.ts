import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import {
  type UserInfoV2Response,
  userGetInfoV2,
} from "@/components/networking";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";

const userKeys = createQueryKeys("users");

export const useCurrentUser = (): UseQueryResult<UserInfoV2Response> => {
  const { accessToken, userId } = useAuthorized();
  return useQuery<UserInfoV2Response>({
    queryKey: userKeys.detail(userId!),
    queryFn: async () => {
      return await userGetInfoV2(accessToken!);
    },
    enabled: Boolean(accessToken && userId),
  });
};
