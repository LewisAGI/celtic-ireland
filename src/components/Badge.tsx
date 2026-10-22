import { badgeFor, labelNote } from '../content';

export function Badge({ label }: { label: string }) {
  const kind = badgeFor(label);
  const note = labelNote(label);
  return (
    <p className="badge-row">
      <span className={`badge badge-${kind}`} data-badge={kind} data-label={label}>
        {kind}
      </span>
      {note ? <span className="badge-note">{note}</span> : null}
    </p>
  );
}
