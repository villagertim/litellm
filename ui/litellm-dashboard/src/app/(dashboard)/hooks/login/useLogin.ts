import { type LoginRequest, loginCall } from "@/components/networking";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: async ({ username, password, useV3 }: LoginRequest) => {
      const result = await loginCall(username, password, useV3);
      return result;
    },
  });
};
