import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import React from "react";

export function OnboardingLoadingView() {
  return (
    <div className="mx-auto w-full max-w-md mt-10 flex justify-center">
      <Spin indicator={<LoadingOutlined spin />} size="large" />
    </div>
  );
}
