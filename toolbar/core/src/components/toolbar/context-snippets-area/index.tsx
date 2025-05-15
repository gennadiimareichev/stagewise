import { useChatState } from '@/hooks/use-chat-state';
import type { ComponentChildren, VNode } from 'preact';
import { memo } from 'preact/compat';
import { useState } from 'preact/hooks';
import type { ContextSnippetOffer } from '@/plugin';
import { Badge } from '@/components/ui/badge';

export const ContextSnippetsArea = memo(() => {
  const { chatAreaState, contextSnippetOffers } = useChatState();

  if (chatAreaState === 'hidden') return null;
  return (
    <SnippetsContainer>
      <SnippetsArea contextSnippetOffers={contextSnippetOffers} />
    </SnippetsContainer>
  );
});

const SnippetsContainer = memo(
  ({ children }: { children: ComponentChildren }) => (
    <div className="h-auto w-auto overflow-x-hidden">{children}</div>
  ),
);

// Badge content wrapper to satisfy VNode type requirements
const BadgeContent = ({ icon, label }: { icon: VNode; label: string }) => (
  <>
    {icon}
    <span className="ml-1">{label}</span>
  </>
);

const SnippetsArea = memo(
  ({
    contextSnippetOffers,
  }: { contextSnippetOffers: ContextSnippetOffer[] }) => {
    const { chatAreaState } = useChatState();

    if (contextSnippetOffers.length === 0 || chatAreaState === 'hidden') {
      return null;
    }

    const [selectedSnippets, setSelectedSnippets] = useState<
      Record<string, string[]>
    >({});

    const handleSnippetToggle = (snippetName: string) => {
      setSelectedSnippets((prev) => {
        const currentSelected = prev[snippetName] || [];
        if (currentSelected.includes(snippetName)) {
          // Remove if already selected
          return {
            ...prev,
            [snippetName]: currentSelected.filter((id) => id !== snippetName),
          };
        } else {
          // Add if not selected
          return {
            ...prev,
            [snippetName]: [...currentSelected, snippetName],
          };
        }
      });
    };

    return (
      <div className="flex w-full flex-col gap-1 p-2">
        <div className="text-sm text-zinc-950/50">
          {contextSnippetOffers.map((snippet) => (
            <Badge
              key={snippet.promptContextName}
              selected={selectedSnippets[snippet.promptContextName]?.length > 0}
              className="cursor-pointer"
              onClick={() => handleSnippetToggle(snippet.promptContextName)}
            >
              <BadgeContent
                icon={
                  <img
                    src={snippet.iconUrl}
                    className="size-4 rounded-full"
                    alt={snippet.promptContextName}
                  />
                }
                label={snippet.displayName}
              />
            </Badge>
          ))}
        </div>
      </div>
    );
  },
);
