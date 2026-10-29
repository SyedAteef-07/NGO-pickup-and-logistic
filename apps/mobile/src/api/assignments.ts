import type { Assignment, AssignmentTransition, Page } from '@aaharaconnect/shared';
import { getCurrentAccessToken } from './auth';
import { apiRequest } from './client';

async function authHeaders() {
  return { Authorization: `Bearer ${await getCurrentAccessToken()}` };
}

export async function listOwnAssignments(): Promise<Assignment[]> {
  const page = await apiRequest<Page<Assignment>>('assignments/me', { headers: await authHeaders() });
  return page.items;
}

export async function transitionOwnAssignment(
  assignmentId: string,
  input: Pick<AssignmentTransition, 'action' | 'expectedVersion' | 'reason'>,
): Promise<Assignment> {
  return apiRequest<Assignment>(`assignments/${encodeURIComponent(assignmentId)}/status`, {
    method: 'PATCH', headers: await authHeaders(), body: input,
  });
}
