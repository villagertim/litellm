import {
  type AccessGroupCreateParams,
  useCreateAccessGroup,
} from "@/app/(dashboard)/hooks/accessGroups/useCreateAccessGroup";
import MessageManager from "@/components/molecules/message_manager";
import { Form, Modal } from "antd";
import React from "react";
import {
  AccessGroupBaseForm,
  type AccessGroupFormValues,
} from "./AccessGroupBaseForm";

interface AccessGroupCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function AccessGroupCreateModal({
  visible,
  onCancel,
  onSuccess,
}: AccessGroupCreateModalProps) {
  const [form] = Form.useForm<AccessGroupFormValues>();
  const createMutation = useCreateAccessGroup();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const params: AccessGroupCreateParams = {
          access_group_name: values.name,
          description: values.description,
          access_model_names: values.modelIds,
          access_mcp_server_ids: values.mcpServerIds,
          access_agent_ids: values.agentIds,
        };

        createMutation.mutate(params, {
          onSuccess: () => {
            MessageManager.success("Access group created successfully");
            form.resetFields();
            onSuccess?.();
            onCancel();
          },
        });
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Create Access Group"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okText="Create Group"
      cancelText="Cancel"
      confirmLoading={createMutation.isPending}
      destroyOnClose
    >
      <AccessGroupBaseForm form={form} />
    </Modal>
  );
}
