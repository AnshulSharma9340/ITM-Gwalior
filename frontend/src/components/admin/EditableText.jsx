import { useEffect, useRef } from 'react';
import { useEditMode } from '../../context/EditModeContext';

/*
 * Click-to-edit text. The saved override (or `value` fallback) is the source of
 * truth — `getText` resolves it, so edits persist and reflect after leaving edit
 * mode. In edit mode it renders a contentEditable element seeded with that text
 * and saves on blur.
 *
 * Two display modes:
 *   • default        — renders the resolved text as-is (use for plain copy).
 *   • rich={true}    — renders `children` instead, for callers that transform the
 *                      text themselves (e.g. Hero's gradient-split headline, which
 *                      rebuilds `children` from the same resolved value).
 *
 * Edit affordance:
 *   • Maroon dashed ring (brand colour) + tiny pencil glyph painted in the
 *     top-right corner via an inline SVG background, so the user can see
 *     every editable element at a glance.
 */

// Inline pencil SVG → painted via background-image so we don't need a wrapper.
const PENCIL_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23800000\'>' +
      '<circle cx=\'12\' cy=\'12\' r=\'11\' fill=\'%23ffffff\' stroke=\'%23800000\' stroke-width=\'2\'/>' +
      '<path d=\'M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06m3.66-6.06c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z\'/>' +
    '</svg>'
  ) +
  '")';

export default function EditableText({
  pageKey,
  tkey,
  value,
  as: Tag = 'span',
  className = '',
  children,
  multiline = false,
  rich = false,
  onCommit,
}) {
  const { editMode, getText, setText } = useEditMode();
  const ref = useRef(null);
  // Controlled mode (onCommit): caller owns the value (e.g. a list-item field).
  // Otherwise the text is resolved from / saved to the page's text overrides.
  const controlled = typeof onCommit === 'function';
  const text = controlled ? value : getText(pageKey, tkey, value);

  // Keep the DOM text in sync with the resolved text when entering edit mode.
  useEffect(() => {
    if (editMode && ref.current && ref.current.innerText !== text) {
      ref.current.innerText = text ?? '';
    }
  }, [editMode, text]);

  if (!editMode) {
    return <Tag className={className}>{rich && children != null ? children : text}</Tag>;
  }

  const commit = () => {
    const next = ref.current?.innerText ?? '';
    if (next === text) return;
    if (controlled) onCommit(next);
    else setText(pageKey, tkey, next);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={commit}
      onKeyDown={(e) => {
        // Enter commits for single-line fields; Shift+Enter always inserts a line.
        if (e.key === 'Enter' && !multiline && !e.shiftKey) {
          e.preventDefault();
          ref.current?.blur();
        }
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      title="Click to edit text"
      style={{
        backgroundImage: PENCIL_BG,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top -8px right -8px',
        backgroundSize: '18px 18px',
      }}
      className={`${className} pointer-events-auto cursor-text outline-none rounded-sm ring-1 ring-dashed ring-[#800000]/60 hover:ring-[#800000] focus:ring-2 focus:ring-[#800000] focus:ring-solid hover:bg-[#800000]/5 transition-shadow pr-2.5 pl-1`}
    >
      {text}
    </Tag>
  );
}
