"use client";

import { setMessageInstance } from "@/components/molecules/message_manager";
import { setNotificationInstance } from "@/components/molecules/notifications_manager";
import { message, notification } from "antd";
import type React from "react";
import { useEffect, useRef } from "react";

export default function AntdGlobalProvider({
  children,
}: { children: React.ReactNode }) {
  const [notificationApi, notificationContextHolder] =
    notification.useNotification();
  const [messageApi, messageContextHolder] = message.useMessage();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      setNotificationInstance(notificationApi);
      setMessageInstance(messageApi);
      initialized.current = true;
    }
  }, [notificationApi, messageApi]);

  return (
    <>
      {notificationContextHolder}
      {messageContextHolder}
      {children}
    </>
  );
}
