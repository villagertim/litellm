import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import { tagListCall } from "@/components/networking";
import type { TagListResponse } from "@/components/tag_management/types";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";

const tagKeys = createQueryKeys("tags");

export const useTags = (): UseQueryResult<TagListResponse> => {
  const { accessToken, userId, userRole } = useAuthorized();
  return useQuery<TagListResponse>({
    queryKey: tagKeys.list({}),
    queryFn: async () => await tagListCall(accessToken!),
    enabled: Boolean(accessToken && userId && userRole),
  });
};
