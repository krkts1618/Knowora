"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  FolderSymlink,
  ArrowUp,
  ArrowDown,
  FileText,
  Search,
  X,
  ChevronsUpDown,
} from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";

export interface TopicItemData {
  id: string;
  title: string;
  documentId: string;
  parentTopicId: string | null;
  position: number;
  plainText?: string;
  content?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TopicTreeNodeData extends TopicItemData {
  children: TopicTreeNodeData[];
}

export interface TopicTreeProps {
  topics: TopicItemData[];
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onCreateTopic: (parentTopicId?: string | null) => void;
  onRenameTopic: (topic: TopicItemData) => void;
  onMoveTopic: (topic: TopicItemData) => void;
  onDeleteTopic: (topic: TopicItemData) => void;
  onReorderTopic: (topicId: string, newPosition: number) => void;
}

export function TopicTree({
  topics,
  activeTopicId,
  onSelectTopic,
  onCreateTopic,
  onRenameTopic,
  onMoveTopic,
  onDeleteTopic,
  onReorderTopic,
}: TopicTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

  // Build tree from flat topics array
  const { tree, topicMap } = useMemo(() => {
    const map = new Map<string, TopicTreeNodeData>();
    const roots: TopicTreeNodeData[] = [];

    for (const t of topics) {
      map.set(t.id, { ...t, children: [] });
    }

    for (const t of topics) {
      const node = map.get(t.id)!;
      if (t.parentTopicId && map.has(t.parentTopicId)) {
        map.get(t.parentTopicId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortNodes = (nodes: TopicTreeNodeData[]) => {
      nodes.sort(
        (a, b) =>
          a.position - b.position ||
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      for (const n of nodes) sortNodes(n.children);
    };

    sortNodes(roots);
    return { tree: roots, topicMap: map };
  }, [topics]);

  // Handle expand/collapse toggle
  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedMap((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  // Expand / collapse all
  const toggleExpandAll = () => {
    const allExpanded = topics.every((t) => expandedMap[t.id] !== false);
    const nextMap: Record<string, boolean> = {};
    for (const t of topics) {
      nextMap[t.id] = !allExpanded;
    }
    setExpandedMap(nextMap);
  };

  // Filter tree based on search query
  const q = searchQuery.trim().toLowerCase();

  const matchingIds = useMemo(() => {
    if (!q) return new Set<string>();
    const ids = new Set<string>();

    for (const t of topics) {
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchText = t.plainText ? t.plainText.toLowerCase().includes(q) : false;

      if (matchTitle || matchText) {
        ids.add(t.id);
        // Expand ancestor path
        let parentId = t.parentTopicId;
        while (parentId && topicMap.has(parentId)) {
          ids.add(parentId);
          parentId = topicMap.get(parentId)!.parentTopicId;
        }
      }
    }
    return ids;
  }, [q, topics, topicMap]);

  // Recursive tree node renderer
  const renderNode = (node: TopicTreeNodeData, depth = 0, siblings: TopicTreeNodeData[], index: number) => {
    const hasChildren = node.children.length > 0;
    // Default expanded unless explicitly set to false or search query matches
    const isExpanded = q ? true : expandedMap[node.id] !== false;
    const isActive = node.id === activeTopicId;
    const isMatched = q ? matchingIds.has(node.id) : false;

    if (q && !matchingIds.has(node.id)) {
      return null;
    }

    const canMoveUp = index > 0;
    const canMoveDown = index < siblings.length - 1;

    const menuItems: DropdownMenuItem[] = [
      {
        label: "New Subtopic",
        icon: <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />,
        onClick: () => onCreateTopic(node.id),
      },
      {
        label: "Rename",
        icon: <Pencil className="w-3.5 h-3.5" />,
        onClick: () => onRenameTopic(node),
      },
      {
        divider: true,
        label: "",
      },
      {
        label: "Move Up",
        icon: <ArrowUp className="w-3.5 h-3.5" />,
        disabled: !canMoveUp,
        onClick: () => {
          const prevSibling = siblings[index - 1];
          if (prevSibling) onReorderTopic(node.id, prevSibling.position - 1);
        },
      },
      {
        label: "Move Down",
        icon: <ArrowDown className="w-3.5 h-3.5" />,
        disabled: !canMoveDown,
        onClick: () => {
          const nextSibling = siblings[index + 1];
          if (nextSibling) onReorderTopic(node.id, nextSibling.position + 1);
        },
      },
      {
        label: "Move to Parent...",
        icon: <FolderSymlink className="w-3.5 h-3.5" />,
        onClick: () => onMoveTopic(node),
      },
      {
        divider: true,
        label: "",
      },
      {
        label: "Delete Topic",
        icon: <Trash2 className="w-3.5 h-3.5" />,
        danger: true,
        onClick: () => onDeleteTopic(node),
      },
    ];

    return (
      <div key={node.id} className="flex flex-col select-none">
        <div
          onClick={() => onSelectTopic(node.id)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`group flex items-center justify-between pr-2 py-1.5 rounded-xl cursor-pointer text-xs transition-all ${
            isActive
              ? "bg-[var(--accent)] text-[var(--accent-foreground)] font-semibold shadow-xs"
              : isMatched
              ? "bg-[var(--surface-muted)] text-[var(--accent)] hover:bg-[var(--surface-hover)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(node.id, e)}
                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center shrink-0">
                <FileText className="w-3 h-3 opacity-60" />
              </div>
            )}

            <span className="truncate text-xs">{node.title}</span>
          </div>

          <div
            className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick add subtopic button */}
            <button
              type="button"
              onClick={() => onCreateTopic(node.id)}
              className={`p-1 rounded-lg transition-colors ${
                isActive
                  ? "hover:bg-black/15 text-[var(--accent-foreground)]"
                  : "hover:bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
              title="Add Subtopic"
            >
              <Plus className="w-3 h-3" />
            </button>

            {/* Context menu */}
            <DropdownMenu
              align="right"
              trigger={
                <button
                  type="button"
                  className={`p-1 rounded-lg transition-colors ${
                    isActive
                      ? "hover:bg-black/15 text-[var(--accent-foreground)]"
                      : "hover:bg-[var(--surface-muted)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  title="Topic actions"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              }
              items={menuItems}
            />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col mt-0.5">
            {node.children.map((child, childIdx) =>
              renderNode(child, depth + 1, node.children, childIdx)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] overflow-hidden">
      {/* Top Search & Actions Bar */}
      <div className="p-3 border-b border-[var(--border)] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Topics ({topics.length})
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleExpandAll}
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Toggle expand/collapse all"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onCreateTopic(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] transition-colors shadow-xs"
              title="Create Root Topic"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics in document..."
            className="w-full pl-7 pr-7 py-1 text-xs rounded-xl border border-[var(--border)] bg-[var(--canvas)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Topics Hierarchy List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
        {topics.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--accent)] opacity-40" />
            <span>No topics yet. Click &ldquo;New&rdquo; above to create your first study topic.</span>
          </div>
        ) : q && matchingIds.size === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-1.5">
            <Search className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
            <span>No topics found matching &ldquo;{searchQuery}&rdquo;.</span>
          </div>
        ) : (
          tree.map((node, index) => renderNode(node, 0, tree, index))
        )}
      </div>
    </div>
  );
}
