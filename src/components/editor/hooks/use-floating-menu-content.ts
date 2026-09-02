'use client';

import {
  ImageResizeDirectionEnum,
  LinkPickerTypeEnum,
} from '@/src/constants/content-editor.constants';
import { ROUTES } from '@/src/constants/routes.constants';
import { useGetPageLinks } from '@/src/hooks/page/use-get-page-links';
import { useGetProjects } from '@/src/hooks/projects/use-get-projects';
import type { PageSidebarItem } from '@/src/types/pages.types';
import type { ProjectResponse } from '@/src/types/projects.types';
import { clamp, normalizeUrl } from '@/src/utils/content-editor.utils';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code2,
  Columns3,
  FilePlus2,
  Heading1,
  Heading2,
  Highlighter,
  ImagePlus,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquareQuote,
  Minus,
  Paperclip,
  Quote,
  Redo2,
  Strikethrough,
  Table2,
  Trash2,
  UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { LinkChipType } from '../extensions';

export type QuickAction = {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  disabled?: boolean;
  keepMenuOpen?: boolean;
  execute: () => void;
};

export type SlashCommand = {
  label: string;
  description: string;
  icon: React.ElementType;
  execute: () => void;
};

export type LinkPickerItem = {
  id: string;
  type: LinkPickerTypeEnum;
  title: string;
  subtitle: string;
  href: string;
  depth?: number;
};

function extractWorkspaceId(pathname: string): string | undefined {
  const segments = pathname.split('/').filter(Boolean);
  const workspaceIndex = segments.indexOf('workspace');

  if (workspaceIndex === -1) {
    return undefined;
  }

  return segments[workspaceIndex + 1];
}

type FlatPageItem = {
  page: PageSidebarItem;
  depth: number;
};

function buildFlatPageTree(items: PageSidebarItem[]): FlatPageItem[] {
  const byParent = new Map<string | null, PageSidebarItem[]>();
  const byId = new Map<string, PageSidebarItem>();

  items.forEach((item) => {
    byId.set(item.id, item);
  });

  items.forEach((item) => {
    const parentKey =
      item.parentPageId && byId.has(item.parentPageId)
        ? item.parentPageId
        : null;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push(item);
    byParent.set(parentKey, siblings);
  });

  byParent.forEach((list) => {
    list.sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return a.title.localeCompare(b.title);
    });
  });

  const result: FlatPageItem[] = [];

  const visit = (parentId: string | null, depth: number) => {
    const children = byParent.get(parentId) ?? [];
    children.forEach((child) => {
      result.push({ page: child, depth });
      visit(child.id, depth + 1);
    });
  };

  visit(null, 0);
  return result;
}

function getProjectHref(project: ProjectResponse): string {
  return `${ROUTES.WORKSPACE}/${project.workspaceId}/${project.id}`;
}

function getPageHref(
  workspaceId: string,
  projectId: string,
  pageId: string,
): string {
  return `${ROUTES.WORKSPACE}/${workspaceId}/${projectId}/${pageId}`;
}

interface FloatingMenuContentInterface {
  editor: Editor | null;
  openImagePicker: () => void;
  openFilePicker: () => void;
  insertImageFromUrl: () => void;
  isUploadingAttachment: boolean;
  setEditorMinHeight: Dispatch<SetStateAction<number>>;
  resizeActiveImage: (direction: ImageResizeDirectionEnum) => void;
  deleteCurrentBlock: () => void;
  floatingMenuOpen: boolean;
  enableTaskBoard?: boolean;
}

export function useFloatingMenuContent({
  editor,
  openImagePicker,
  openFilePicker,
  insertImageFromUrl,
  isUploadingAttachment,
  setEditorMinHeight,
  resizeActiveImage,
  deleteCurrentBlock,
  floatingMenuOpen,
  enableTaskBoard = true,
}: FloatingMenuContentInterface) {
  const pathname = usePathname();
  const workspaceId = useMemo(() => extractWorkspaceId(pathname), [pathname]);
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);
  const [linkPickerQuery, setLinkPickerQuery] = useState('');

  const { data: projectsData } = useGetProjects({ workspaceId });

  const projects = useMemo(() => projectsData?.projects ?? [], [projectsData]);

  const pagesByProjectQueries = useGetPageLinks(
    projects.map((project) => project.id),
    floatingMenuOpen,
  );

  const isLinkPickerVisible = isLinkPickerOpen && floatingMenuOpen;

  const insertLinkChip = (
    href: string,
    fallbackLabel: string,
    linkType: LinkChipType,
  ) => {
    if (!editor) {
      return;
    }

    const { from, to, empty } = editor.state.selection;
    const label = empty
      ? fallbackLabel.trim() || href
      : editor.state.doc.textBetween(from, to, ' ').trim() ||
        fallbackLabel.trim() ||
        href;

    editor
      .chain()
      .focus()
      .insertContentAt(
        { from, to },
        { type: 'linkChip', attrs: { href, label, linkType } },
      )
      .run();
  };

  const linkPickerItems = useMemo<LinkPickerItem[]>(() => {
    if (!workspaceId) {
      return [];
    }

    const projectItems: LinkPickerItem[] = projects.map((project) => ({
      id: `project-${project.id}`,
      type: LinkPickerTypeEnum.PROJECT,
      title: project.name,
      subtitle: 'Project',
      href: getProjectHref(project),
    }));

    const pageItems: LinkPickerItem[] = projects.flatMap((project, index) => {
      const pages = pagesByProjectQueries[index]?.data?.pages ?? [];
      const flatPages = buildFlatPageTree(pages);

      return flatPages.map(({ page, depth }) => ({
        id: `page-${project.id}-${page.id}`,
        type: LinkPickerTypeEnum.PAGE,
        title: `${depth > 0 ? '└ ' : ''}${page.title}`,
        subtitle: project.name,
        href: getPageHref(workspaceId, project.id, page.id),
        depth,
      }));
    });

    const normalizedQuery = linkPickerQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return [...projectItems, ...pageItems];
    }

    return [...projectItems, ...pageItems].filter((item) =>
      `${item.title} ${item.subtitle}`.toLowerCase().includes(normalizedQuery),
    );
  }, [linkPickerQuery, pagesByProjectQueries, projects, workspaceId]);
  const activeStateSnapshot = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      isBold: currentEditor?.isActive('bold') ?? false,
      isItalic: currentEditor?.isActive('italic') ?? false,
      isUnderline: currentEditor?.isActive('underline') ?? false,
      isStrike: currentEditor?.isActive('strike') ?? false,
      isHighlight: currentEditor?.isActive('highlight') ?? false,
      isLink: currentEditor?.isActive('link') ?? false,
      isTable: currentEditor?.isActive('table') ?? false,
      isImage: currentEditor?.isActive('image') ?? false,
    }),
  });
  const activeState = useMemo(
    () =>
      activeStateSnapshot ?? {
        isBold: false,
        isItalic: false,
        isUnderline: false,
        isStrike: false,
        isHighlight: false,
        isLink: false,
        isTable: false,
        isImage: false,
      },
    [activeStateSnapshot],
  );

  const slashCommands = useMemo<SlashCommand[]>(() => {
    if (!editor) return [];

    return [
      {
        label: 'Text',
        description: 'Just start writing',
        icon: FilePlus2,
        execute: () => editor.chain().focus().setParagraph().run(),
      },
      {
        label: 'Heading 1',
        description: 'Big section heading',
        icon: Heading1,
        execute: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        label: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        execute: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        label: 'To-do list',
        description: 'Track a task',
        icon: CheckSquare,
        execute: () => editor.chain().focus().toggleTaskList().run(),
      },
      {
        label: 'Bulleted list',
        description: 'Create a simple list',
        icon: List,
        execute: () => editor.chain().focus().toggleBulletList().run(),
      },
      {
        label: 'Numbered list',
        description: 'Create an ordered list',
        icon: ListOrdered,
        execute: () => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        label: 'Quote',
        description: 'Capture a quotation',
        icon: Quote,
        execute: () => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        label: 'Callout',
        description: 'Make an important note',
        icon: MessageSquareQuote,
        execute: () =>
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'callout',
              attrs: { tone: 'blue' },
              content: [{ type: 'text', text: 'Write a note…' }],
            })
            .run(),
      },
      {
        label: 'Code',
        description: 'Display code',
        icon: Code2,
        execute: () => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        label: 'Table',
        description: 'Add a 3 × 3 table',
        icon: Table2,
        execute: () =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      ...(enableTaskBoard
        ? [
            {
              label: 'Task board',
              description: 'Kanban columns for tasks',
              icon: Columns3,
              execute: () => editor.chain().focus().insertTaskBoard().run(),
            } satisfies SlashCommand,
          ]
        : []),
      {
        label: 'Divider',
        description: 'Separate sections',
        icon: Minus,
        execute: () => editor.chain().focus().setHorizontalRule().run(),
      },
      {
        label: 'Image upload',
        description: 'Upload an image from your device',
        icon: ImageUp,
        execute: openImagePicker,
      },
      {
        label: 'File upload',
        description: 'Upload a file from your device',
        icon: Paperclip,
        execute: openFilePicker,
      },
      {
        label: 'Image URL',
        description: 'Embed an image from a URL',
        icon: ImagePlus,
        execute: insertImageFromUrl,
      },
      {
        label: 'File link',
        description: 'Attach a file by public URL (legacy)',
        icon: FilePlus2,
        execute: () => {
          const hrefRaw = window.prompt('Paste a public file URL');
          if (!hrefRaw) return;

          const href = normalizeUrl(hrefRaw);

          if (!href) {
            toast.error('Please enter a valid file URL.');
            return;
          }

          const title =
            window.prompt('File name', href.split('/').pop() || 'Attachment') ||
            'Attachment';

          editor
            .chain()
            .focus()
            .insertContent({
              type: 'attachment',
              attrs: {
                href,
                title,
                name: title,
              },
            })
            .run();
        },
      },
    ];
  }, [
    editor,
    enableTaskBoard,
    insertImageFromUrl,
    openFilePicker,
    openImagePicker,
  ]);

  const quickActions = useMemo<QuickAction[]>(() => {
    if (!editor) return [];

    const actions: QuickAction[] = [
      {
        label: 'Undo',
        icon: Undo2,
        execute: () => editor.chain().focus().undo().run(),
      },
      {
        label: 'Redo',
        icon: Redo2,
        execute: () => editor.chain().focus().redo().run(),
      },
      {
        label: 'Bold',
        icon: Bold,
        active: activeState.isBold,
        execute: () => editor.chain().focus().toggleBold().run(),
      },
      {
        label: 'Italic',
        icon: Italic,
        active: activeState.isItalic,
        execute: () => editor.chain().focus().toggleItalic().run(),
      },
      {
        label: 'Underline',
        icon: UnderlineIcon,
        active: activeState.isUnderline,
        execute: () => editor.chain().focus().toggleUnderline().run(),
      },
      {
        label: 'Strikethrough',
        icon: Strikethrough,
        active: activeState.isStrike,
        execute: () => editor.chain().focus().toggleStrike().run(),
      },
      {
        label: 'Highlight',
        icon: Highlighter,
        active: activeState.isHighlight,
        execute: () =>
          editor.chain().focus().toggleHighlight({ color: '#fbe5d6' }).run(),
      },
      {
        label: 'Link',
        icon: Link2,
        active: activeState.isLink || isLinkPickerVisible,
        keepMenuOpen: true,
        execute: () => {
          setIsLinkPickerOpen((prev) => {
            if (!prev) {
              setLinkPickerQuery('');
            }
            return !prev;
          });
        },
      },
      {
        label: 'Align left',
        icon: AlignLeft,
        execute: () => editor.chain().focus().setTextAlign('left').run(),
      },
      {
        label: 'Align center',
        icon: AlignCenter,
        execute: () => editor.chain().focus().setTextAlign('center').run(),
      },
      {
        label: 'Align right',
        icon: AlignRight,
        execute: () => editor.chain().focus().setTextAlign('right').run(),
      },
      {
        label: 'Image upload',
        icon: ImageUp,
        disabled: isUploadingAttachment,
        execute: openImagePicker,
      },
      {
        label: 'File upload',
        icon: Paperclip,
        disabled: isUploadingAttachment,
        execute: openFilePicker,
      },
      {
        label: 'Editor taller',
        icon: Heading1,
        execute: () =>
          setEditorMinHeight((prev) => clamp(prev + 120, 320, 2400)),
      },
      {
        label: 'Editor shorter',
        icon: Heading2,
        execute: () =>
          setEditorMinHeight((prev) => clamp(prev - 120, 320, 2400)),
      },
    ];

    if (activeState.isTable) {
      actions.push(
        {
          label: 'Table: add row',
          icon: Table2,
          execute: () => editor.chain().focus().addRowAfter().run(),
        },
        {
          label: 'Table: add column',
          icon: Table2,
          execute: () => editor.chain().focus().addColumnAfter().run(),
        },
        {
          label: 'Table: delete row',
          icon: Table2,
          execute: () => editor.chain().focus().deleteRow().run(),
        },
        {
          label: 'Table: delete column',
          icon: Table2,
          execute: () => editor.chain().focus().deleteColumn().run(),
        },
        {
          label: 'Table: delete',
          icon: Trash2,
          execute: () => editor.chain().focus().deleteTable().run(),
        },
      );
    }

    if (activeState.isImage) {
      actions.push(
        {
          label: 'Image wider',
          icon: ImagePlus,
          execute: () => resizeActiveImage(ImageResizeDirectionEnum.INCREASE),
        },
        {
          label: 'Image narrower',
          icon: ImageUp,
          execute: () => resizeActiveImage(ImageResizeDirectionEnum.DECREASE),
        },
      );
    }

    actions.push({
      label: 'Delete block',
      icon: Trash2,
      execute: deleteCurrentBlock,
    });

    return actions;
  }, [
    activeState,
    deleteCurrentBlock,
    editor,
    isLinkPickerVisible,
    isUploadingAttachment,
    openFilePicker,
    openImagePicker,
    resizeActiveImage,
    setEditorMinHeight,
  ]);

  const setExternalLinkFromPrompt = () => {
    if (!editor) {
      return;
    }

    const hrefRaw = window.prompt('Paste a link');
    if (!hrefRaw) return;

    const href = normalizeUrl(hrefRaw);

    if (!href) {
      toast.error('Please enter a valid link.');
      return;
    }

    const fallbackTitle = href.replace(/^https?:\/\//, '');
    insertLinkChip(href, fallbackTitle, 'external');
  };

  return {
    quickActions,
    slashCommands,
    isLinkPickerOpen: isLinkPickerVisible,
    linkPickerQuery,
    setLinkPickerQuery,
    linkPickerItems,
    selectLinkPickerItem: (item: LinkPickerItem) => {
      insertLinkChip(item.href, item.title.replace(/^└\s*/, ''), item.type);
      setIsLinkPickerOpen(false);
      setLinkPickerQuery('');
    },
    setExternalLinkFromPrompt,
  };
}
