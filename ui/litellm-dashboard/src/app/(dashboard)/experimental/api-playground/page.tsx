"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import TransformRequestPanel from "@/components/transform_request";

const APIPlaygroundPage = () => {
  const { accessToken } = useAuthorized();

  return <TransformRequestPanel accessToken={accessToken} />;
};

export default APIPlaygroundPage;
