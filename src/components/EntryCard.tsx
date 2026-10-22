import { entryTitle, exampleBanner, isMapped, taleMark } from '../content';
import type { Atlas, Entry } from '../types';
import { Badge } from './Badge';

export function EntryCard({
  entry,
  atlas,
  focused,
  match,
  onChoose,
}: {
  entry: Entry;
  atlas: Atlas;
  focused?: boolean;
  /** null while no period filter is set. */
  match?: boolean | null;
  onChoose?: () => void;
}) {
  const title = entryTitle(entry);
  const mapped = isMapped(entry);
  const banner = exampleBanner(entry);
  return (
    <article
      id={`entry-${entry.id}`}
      className="entry"
      data-entry={entry.id}
      data-debate={entry.debate ? 'true' : 'false'}
      data-has-pin={mapped ? 'true' : 'false'}
      data-focus={focused ? 'true' : 'false'}
      data-figure={entry.figure_type}
      data-year={entry.year}
      data-match={match == null ? 'all' : match ? 'true' : 'false'}
    >
      {title ? (
        <h2 className="entry-title">
          {onChoose ? (
            <button type="button" className="text-button" onClick={onChoose}>
              {title}
            </button>
          ) : (
            title
          )}
        </h2>
      ) : null}
      <Badge label={entry.label} tale={taleMark(entry)} />
      {banner ? <p className="example-data">{banner}</p> : null}
      <p className="entry-text">{entry.text}</p>
      {entry.uncertainty ? (
        <p className="qualifier" data-field="uncertainty">
          {entry.uncertainty}
        </p>
      ) : null}
      {entry.sensitivity ? (
        <p className="qualifier" data-field="sensitivity">
          {entry.sensitivity}
        </p>
      ) : null}
      {entry.myth_link ? (
        <p className="qualifier" data-field="myth">
          {entry.myth_link}
        </p>
      ) : null}
      {entry.note ? (
        <p className="qualifier" data-field="note">
          {entry.note}
        </p>
      ) : null}
      {entry.coords?.source_format ? (
        <p className="qualifier" data-field="coords">
          {entry.coords.source_format}
        </p>
      ) : null}
      {!mapped && entry.coords === null ? (
        <p className="qualifier" data-unmapped={entry.id}>
          No coordinates in this pack
        </p>
      ) : null}
      <ul className="source-list">
        {entry.sources.map((id) => {
          const source = atlas.sources.find((item) => item.id === id);
          if (!source) return null;
          return (
            <li key={id}>
              <a href={source.url} target="_blank" rel="noreferrer noopener">
                {source.title}
              </a>
              <span>{source.author_org}</span>
              <span>{source.quality}</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
