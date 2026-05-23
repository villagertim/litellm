import { ClearOutlined } from "@ant-design/icons";
import { Button as TremorButton } from "@tremor/react";
import type React from "react";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import VariableInput from "./VariableInput";
import VariableWarning from "./VariableWarning";
import type { ConversationPanelProps } from "./types";
import { useConversation } from "./useConversation";

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  prompt,
  accessToken,
}) => {
  const {
    isLoading,
    messages,
    inputMessage,
    variables,
    variablesFilled,
    extractedVariables,
    allVariablesFilled,
    messagesEndRef,
    setInputMessage,
    handleSendMessage,
    handleCancelRequest,
    handleClearConversation,
    handleKeyDown,
    handleVariableChange,
  } = useConversation(prompt, accessToken);

  return (
    <div className="flex flex-col h-full bg-white">
      {!variablesFilled && (
        <VariableInput
          extractedVariables={extractedVariables}
          variables={variables}
          onVariableChange={handleVariableChange}
        />
      )}

      {messages.length > 0 && (
        <div className="p-3 border-b border-gray-200 bg-white flex justify-end">
          <TremorButton
            onClick={handleClearConversation}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            icon={ClearOutlined}
          >
            Clear Chat
          </TremorButton>
        </div>
      )}

      <MessageList
        messages={messages}
        isLoading={isLoading}
        hasVariables={extractedVariables.length > 0}
        messagesEndRef={messagesEndRef}
      />

      <div className="p-4 border-t border-gray-200 bg-white">
        <VariableWarning
          extractedVariables={extractedVariables}
          variables={variables}
        />

        <MessageInput
          inputMessage={inputMessage}
          isLoading={isLoading}
          isDisabled={
            isLoading ||
            !inputMessage.trim() ||
            (extractedVariables.length > 0 && !allVariablesFilled)
          }
          onInputChange={setInputMessage}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
          onCancel={handleCancelRequest}
        />
      </div>
    </div>
  );
};

export default ConversationPanel;
