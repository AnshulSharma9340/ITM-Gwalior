import { useEditMode } from '../../context/EditModeContext';
import { ArrowUp, ArrowDown, Eye, EyeOff, GripVertical } from 'lucide-react';

/*
 * Wraps a single layout block on a public page. Outside edit mode it renders
 * its children untouched. Inside edit mode it draws an outline + a floating
 * toolbar to move the block up/down or hide it. Hidden blocks collapse to a
 * thin restore strip so the admin can bring them back.
 *
 * Ordering/visibility live in EditModeContext; the parent passes the resolved
 * state in as props and handles persistence via onMove / onToggleHidden.
 */
export default function EditableSection({
  label,
  isFirst,
  isLast,
  hidden,
  onMove,
  onToggleHidden,
  children,
}) {
  const { editMode } = useEditMode();

  if (!editMode) {
    return hidden ? null : children;
  }

  if (hidden) {
    return (
      <div className="relative my-1 flex items-center justify-between gap-3 border border-dashed border-amber-400/60 bg-amber-50/80 dark:bg-amber-500/10 rounded-lg px-4 py-2 text-amber-700 dark:text-amber-300">
        <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <EyeOff size={13} /> Hidden — {label}
        </span>
        <button
          type="button"
          onClick={onToggleHidden}
          className="text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-1.5"
        >
          <Eye size={12} /> Show
        </button>
      </div>
    );
  }

  return (
    <div data-edit-wrapper="1" className="relative group/edit ring-2 ring-[#800000]/30 hover:ring-[#800000]/70 rounded-lg transition-all">
      {/* Block label + controls — floats top-right inside the block */}
      <div data-no-edit="1" className="absolute top-2 right-2 z-40 flex items-center gap-1 rounded-lg bg-[#800000] text-white shadow-lg px-1.5 py-1 opacity-90 group-hover/edit:opacity-100 transition-opacity">
        <GripVertical size={13} className="opacity-70" />
        <span className="text-[10px] font-black uppercase tracking-widest px-1 max-w-[140px] truncate">
          {label}
        </span>
        <span className="w-px h-4 bg-white/30 mx-0.5" />
        <button
          type="button"
          title="Move up"
          disabled={isFirst}
          onClick={() => onMove(-1)}
          className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          title="Move down"
          disabled={isLast}
          onClick={() => onMove(1)}
          className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowDown size={13} />
        </button>
        <button
          type="button"
          title="Hide section"
          onClick={onToggleHidden}
          className="p-1 rounded hover:bg-white/20 transition-colors"
        >
          <EyeOff size={13} />
        </button>
      </div>
      {/* Click-shield so links/buttons inside the block don't fire while editing */}
      <div data-edit-wrapper="1" className="pointer-events-none">{children}</div>
    </div>
  );
}
