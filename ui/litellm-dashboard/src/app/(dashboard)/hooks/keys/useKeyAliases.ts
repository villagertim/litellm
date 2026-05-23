import {
  type PaginatedKeyAliasResponse,
  keyAliasesCall,
} from "@/components/networking";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createQueryKeys } from "../common/queryKeysFactory";
import useAuthorized from "../useAuthorized";

const infiniteKeyAliasKeys = createQueryKeys("infiniteKeyAliases");

export const useInfiniteKeyAliases = (
  size = 50,
  search?: string,
  team_id?: string,
) => {
  const { accessToken } = useAuthorized();
  return useInfiniteQuery<PaginatedKeyAliasResponse>({
    queryKey: infiniteKeyAliasKeys.list({
      filters: {
        size,
        ...(search && { search }),
        ...(team_id && { team_id }),
      },
    }),
    queryFn: async ({ pageParam }) => {
      return await keyAliasesCall(
        accessToken!,
        pageParam as number,
        size,
        search,
        team_id,
      );
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.total_pages) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    enabled: Boolean(accessToken),
  });
};
