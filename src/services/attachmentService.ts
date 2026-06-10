import { apiClient } from "./apiClient";
import { apiRoutes } from "./apiRoutes";
import type { CreateAttachmentRequest, Guid, MessageAttachment } from "@/types";

const createAttachment = async (
  request: CreateAttachmentRequest
): Promise<MessageAttachment> => {
  const response = await apiClient.post<MessageAttachment>(
    apiRoutes.attachments.create,
    request
  );
  return response.data;
};

const getMessageAttachments = async (
  messageId: Guid
): Promise<MessageAttachment[]> => {
  const response = await apiClient.get<MessageAttachment[]>(
    apiRoutes.attachments.byMessage(messageId)
  );
  return response.data;
};

const deleteAttachment = async (attachmentId: Guid): Promise<void> => {
  await apiClient.delete(apiRoutes.attachments.byId(attachmentId));
};

export const attachmentService = {
  createAttachment,
  getMessageAttachments,
  deleteAttachment,
};
