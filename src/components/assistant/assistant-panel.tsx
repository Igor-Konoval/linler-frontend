'use client';

import { PanelLeftIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/src/components/ui/alert-dialog';
import { Button } from '@/src/components/ui/button';
import { ConfirmationDialog } from '@/src/components/ui/confirmation-dialog';
import { useAssistantChat } from '@/src/hooks/assistant/use-assistant-chat';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import type {
  AssistantConversation,
  AssistantMessage,
} from '@/src/types/assistant.types';
import {
  HISTORY_CONTENT_MAX_LENGTH,
  HISTORY_LIMIT,
  MESSAGE_MAX_LENGTH,
} from '@/src/constants/assistant.constants';

export function AssistantPanel({
  conversations,
  activeConversationId,
  messages,
  draft,
  onMessagesChange,
  onDraftChange,
  onCreateConversation,
  onDeleteConversation,
  onSelectConversation,
  onClose,
}: {
  conversations: AssistantConversation[];
  activeConversationId: string;
  messages: AssistantMessage[];
  draft: string;
  onMessagesChange: Dispatch<SetStateAction<AssistantMessage[]>>;
  onDraftChange: Dispatch<SetStateAction<string>>;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSelectConversation: (id: string) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { data: user, isPending } = useGetUser();
  const subscribed = user?.subscriptionActive === true;

  useEffect(() => {
    if (!isPending && !subscribed) {
      panelRef.current?.focus();
    }
  }, [isPending, subscribed]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="linler-assistant-title"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
      className={`bg-popover text-popover-foreground ring-foreground/10 fixed inset-x-4 bottom-4 top-4 z-40 flex flex-col gap-3 overflow-hidden rounded-xl p-4 text-sm shadow-lg outline-none ring-1 transition-[width] duration-300 ease-in-out sm:inset-x-auto sm:right-4 ${
        historyOpen && subscribed
          ? 'sm:w-[min(48rem,calc(100vw-2rem))]'
          : 'sm:w-96'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {subscribed ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={
                historyOpen ? 'Hide chat history' : 'Show chat history'
              }
              aria-expanded={historyOpen}
              aria-controls="assistant-chat-history"
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <PanelLeftIcon />
            </Button>
          ) : null}
          <h2 id="linler-assistant-title" className="text-base font-medium">
            Linler assistant
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
        >
          <XIcon />
        </Button>
      </div>
      <p className="text-muted-foreground">
        The assistant can draft page content, summarize your projects and
        notifications, and make changes when you ask. Your chats and drafts stay
        when you close the panel.
      </p>
      {isPending ? (
        <p className="text-muted-foreground">Loading your account…</p>
      ) : subscribed ? (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          {historyOpen ? (
            <button
              type="button"
              aria-label="Close chat history"
              onClick={() => setHistoryOpen(false)}
              className="bg-background/60 absolute inset-0 z-10 backdrop-blur-[1px] sm:hidden"
            />
          ) : null}
          <aside
            id="assistant-chat-history"
            aria-label="Conversation history"
            aria-hidden={!historyOpen}
            inert={!historyOpen}
            className={`bg-popover absolute inset-y-0 left-0 z-20 flex w-56 flex-col gap-2 overflow-hidden border-r shadow-lg transition-[transform,width,opacity] duration-300 ease-in-out sm:relative sm:inset-y-auto sm:left-auto sm:z-0 sm:shadow-none ${
              historyOpen
                ? 'mr-3.75 translate-x-0 pr-3 sm:w-56 sm:border-r sm:opacity-100'
                : '-translate-x-full sm:w-0 sm:translate-x-0 sm:border-r-0 sm:opacity-0'
            }`}
          >
            {historyOpen ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={onCreateConversation}
                >
                  <PlusIcon />
                  New chat
                </Button>
                <nav
                  aria-label="Chats"
                  className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"
                >
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="group flex min-w-0 items-center gap-1 rounded-md"
                    >
                      <button
                        type="button"
                        aria-pressed={conversation.id === activeConversationId}
                        title={conversation.title}
                        onClick={() => onSelectConversation(conversation.id)}
                        className="hover:bg-muted focus-visible:ring-ring aria-pressed:bg-muted min-w-0 flex-1 truncate rounded-md px-2.5 py-2 text-left outline-none transition-colors focus-visible:ring-2 aria-pressed:font-medium"
                      >
                        {conversation.title}
                      </button>
                      <ConfirmationDialog
                        title="Delete chat?"
                        description={`“${conversation.title}” and its messages will be deleted.`}
                        footerButtons={
                          <>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                onDeleteConversation(conversation.id)
                              }
                            >
                              Delete chat
                            </AlertDialogAction>
                          </>
                        }
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            aria-label={`Delete ${conversation.title}`}
                            title="Delete chat"
                            className="shrink-0 opacity-70 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
                          >
                            <Trash2Icon />
                          </Button>
                        }
                      />
                    </div>
                  ))}
                </nav>
              </>
            ) : null}
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1">
            <AssistantChat
              key={activeConversationId}
              messages={messages}
              draft={draft}
              onDraftChange={onDraftChange}
              onMessagesChange={onMessagesChange}
            />
          </div>
        </div>
      ) : (
        <p>
          The assistant is available while your subscription is active. You can
          subscribe from the Subscription button in the sidebar.
        </p>
      )}
    </div>
  );
}

function AssistantChat({
  messages,
  draft,
  onDraftChange,
  onMessagesChange,
}: {
  messages: AssistantMessage[];
  draft: string;
  onDraftChange: Dispatch<SetStateAction<string>>;
  onMessagesChange: Dispatch<SetStateAction<AssistantMessage[]>>;
}) {
  const chat = useAssistantChat();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendingRef = useRef(false);
  const draftEditRevisionRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const list = listRef.current;

    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [messages, chat.isPending, chat.isError]);

  const send = async () => {
    const draftAtSend = draft;
    const message = draftAtSend.trim();

    if (!message || sendingRef.current || chat.isPending) {
      return;
    }

    const lastMessage = messages.at(-1);
    const alreadyAdded =
      lastMessage?.role === 'user' && lastMessage.content === message;
    const history = (alreadyAdded ? messages.slice(0, -1) : messages)
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }) => ({
        role,
        content: content.slice(0, HISTORY_CONTENT_MAX_LENGTH),
      }));
    const draftEditRevisionAtSend = draftEditRevisionRef.current;
    sendingRef.current = true;
    if (!alreadyAdded) {
      onMessagesChange((current) => [
        ...current,
        { role: 'user', content: message },
      ]);
    }
    onDraftChange((current) => (current === draftAtSend ? '' : current));

    try {
      const result = await chat.mutateAsync({ message, history });
      onMessagesChange((current) => [
        ...current,
        { role: 'assistant', content: result.reply },
      ]);
    } catch {
      if (draftEditRevisionRef.current === draftEditRevisionAtSend) {
        onDraftChange((current) =>
          current.length === 0 ? draftAtSend : current,
        );
      }
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div
        ref={listRef}
        className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((item, index) => (
          <p
            key={`${item.role}-${index}`}
            className={
              item.role === 'user'
                ? 'bg-primary text-primary-foreground ml-8 shrink-0 whitespace-pre-wrap rounded-lg px-2.5 py-1.5'
                : 'bg-muted ml-1 mr-8 shrink-0 whitespace-pre-wrap rounded-lg px-2.5 py-1.5'
            }
          >
            {item.content}
          </p>
        ))}
        {chat.isPending ? (
          <p
            className="bg-muted mx-8 flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5"
            aria-label="The assistant is writing"
          >
            <span className="bg-foreground size-1.5 shrink-0 animate-bounce rounded-full [animation-delay:0ms]" />
            <span className="bg-foreground size-1.5 shrink-0 animate-bounce rounded-full [animation-delay:150ms]" />
            <span className="bg-foreground size-1.5 shrink-0 animate-bounce rounded-full [animation-delay:300ms]" />
          </p>
        ) : null}
      </div>
      {chat.isError ? (
        <p role="alert" className="text-destructive">
          {chat.error.message}
        </p>
      ) : null}
      <form
        className="flex shrink-0 flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(event) => {
            draftEditRevisionRef.current += 1;
            onDraftChange(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          rows={3}
          maxLength={MESSAGE_MAX_LENGTH}
          aria-label="Message"
          placeholder="Ask a question or ask for help"
          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 w-full resize-none rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none"
        />
        <Button
          type="submit"
          className="self-end"
          disabled={chat.isPending || draft.trim().length === 0}
          isLoading={chat.isPending}
        >
          Send
        </Button>
      </form>
    </div>
  );
}
