"use client";

import useAuthorized from "@/app/(dashboard)/hooks/useAuthorized";
import ChatPage from "@/components/chat/ChatPage";
import { Suspense } from "react";

// ChatPage uses useSearchParams() which requires a Suspense boundary for static export.
const ChatPageContent = () => {
  const { accessToken, userRole, userId, userEmail } = useAuthorized();

  return (
    <ChatPage
      accessToken={accessToken ?? ""}
      userRole={userRole ?? ""}
      userId={userId ?? ""}
      userEmail={userEmail ?? ""}
    />
  );
};

const ChatPageRoute = () => (
  <Suspense>
    <ChatPageContent />
  </Suspense>
);

export default ChatPageRoute;
