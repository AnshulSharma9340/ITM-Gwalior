import React from 'react';
import { useEditMode } from '../../context/EditModeContext';
import { ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

/*
 * Add / edit / remove / reorder for repeating content (faculty rows, mission
 * points, PEOs, etc.). The list override lives in EditModeContext, keyed by
 * `pageKey` + `listKey`, seeded from `items` (the page's default array).
 *
 * Render-prop API — `children(item, index, api)` returns the markup for one row.
 * `api` gives:
 *   • setValue(v)          — replace a string item
 *   • setField(name, v)    — patch one field of an object item
 * Bind these to <EditableText onCommit={...}> for inline field editing.
 *
 * Outside edit mode rows render exactly as before (no wrappers). In edit mode
 * each row gets a small toolbar and an "Add" button is appended.
 *
 * Usage:
 *   <EditableList pageKey={pk} listKey="mission" items={dept.mission}
 *     addTemplate="New mission point" addLabel="Add point">
 *     {(m, i, api) => (
 *       <EditableText value={m} multiline onCommit={(v) => api.setValue(v)} />
 *     )}
 *   </EditableList>
 */
export default function EditableList({
  pageKey,
  listKey,
  items = [],
  addTemplate = '',
  addLabel = 'Add item',
  children,
}) {
  const {
    editMode, getList, updateListItem, updateListField,
    addListItem, removeListItem, moveListItem,
  } = useEditMode();

  const list = getList(pageKey, listKey, items) || [];

  return (
    <>
      {list.map((item, i) => {
        const api = {
          index: i,
          setValue: (v) => updateListItem(pageKey, listKey, items, i, v),
          setField: (f, v) => updateListField(pageKey, listKey, items, i, f, v),
        };
        const content = children(item, i, api);

        if (!editMode) return <React.Fragment key={i}>{content}</React.Fragment>;

        return (
          <div key={i} className="relative">
            <div className="absolute -top-2.5 -right-2.5 z-30 flex items-center gap-0.5 rounded-lg bg-[#800000] text-white shadow-lg px-1 py-0.5">
              <button
                type="button"
                title="Move up"
                disabled={i === 0}
                onClick={() => moveListItem(pageKey, listKey, items, i, -1)}
                className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                title="Move down"
                disabled={i === list.length - 1}
                onClick={() => moveListItem(pageKey, listKey, items, i, 1)}
                className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                title="Delete item"
                onClick={() => {
                  if (window.confirm('Delete this item?')) removeListItem(pageKey, listKey, items, i);
                }}
                className="p-1 rounded hover:bg-white/20"
              >
                <Trash2 size={12} />
              </button>
            </div>
            {content}
          </div>
        );
      })}

      {editMode && (
        <button
          type="button"
          onClick={() => addListItem(pageKey, listKey, items, addTemplate)}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-[#800000]/40 text-[#800000] dark:text-rose-300 text-[11px] font-black uppercase tracking-widest hover:bg-[#800000]/5 hover:border-[#800000] transition-colors"
        >
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </>
  );
}
