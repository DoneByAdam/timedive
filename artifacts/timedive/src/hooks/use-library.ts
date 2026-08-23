// Hand-written hooks for endpoints not (yet) covered by the orval-generated
// client in @workspace/api-client-react. Mirrors that client's conventions
// (customFetch, react-query) so it's a drop-in replacement once regenerated.
import { useMutation, useQuery } from '@tanstack/react-query';
import { customFetch } from '@workspace/api-client-react';
import type { SavedStory, ShareResult, ContactInput, MessageResponse, PublicStory } from '@workspace/api-client-react';

export function getListMyStoriesQueryKey() {
  return ['/api/stories'] as const;
}

export function useListMyStories() {
  return useQuery({
    queryKey: getListMyStoriesQueryKey(),
    queryFn: () => customFetch<SavedStory[]>('/api/stories'),
  });
}

export function useShareStory() {
  return useMutation({
    mutationFn: (storyId: number) =>
      customFetch<ShareResult>(`/api/stories/${storyId}/share`, { method: 'POST' }),
  });
}

export function useUnshareStory() {
  return useMutation({
    mutationFn: (storyId: number) =>
      customFetch<MessageResponse>(`/api/stories/${storyId}/share`, { method: 'DELETE' }),
  });
}

export function useGetPublicStory(token: string | undefined) {
  return useQuery({
    queryKey: ['/api/public/stories', token] as const,
    queryFn: () => customFetch<PublicStory>(`/api/public/stories/${token}`),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: ContactInput) =>
      customFetch<MessageResponse>('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  });
}
