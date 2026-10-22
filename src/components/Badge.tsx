import { badgeFor, labelNote } from '../content';
import type { Badge as BadgeKind } from '../types';

const BADGE_TEXT: Record<BadgeKind, string> = {
  evidence: 'evidence',
  inference: 'inference',
  'abstract-only': 'abstract-only',
  'unverified-detail': 'unverified detail',
};

export function Badge({ label, tale }: { label: string; tale?: string | null }) {
  const kind = badgeFor(label);
  const note = labelNote(label);
  return (
    <p className="badge-row">
      <span className={`badge badge-${kind}`} data-badge={kind}>
        {BADGE_TEXT[kind]}
      </span>
      {tale ? (
        <span className="badge badge-tale" data-badge="in-the-tale">
          {tale}
        </span>
      ) : null}
      {note ? <span className="badge-note">{note}</span> : null}
    </p>
  );
}
