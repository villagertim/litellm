import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

interface AntDLoadingSpinnerProps {
  size?: "small" | "default" | "large";
  fontSize?: number;
}

export function AntDLoadingSpinner({
  size,
  fontSize,
}: AntDLoadingSpinnerProps) {
  const indicator = (
    <LoadingOutlined style={fontSize ? { fontSize } : undefined} spin />
  );
  return <Spin indicator={indicator} size={size} />;
}
