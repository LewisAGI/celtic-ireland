import type { CharacterLink } from '../content';

export function CycleGraph({ links }: { links: CharacterLink[] }) {
  if (links.length === 0) return null;
  const row = 56;
  const top = 28;
  const placed = new Map<string, { name: string; y: number; count: number }>();
  links.forEach((link, index) => {
    const y = top + index * row;
    const current = placed.get(link.cycleId);
    if (!current) placed.set(link.cycleId, { name: link.cycleName, y, count: 1 });
    else placed.set(link.cycleId, { name: link.cycleName, y: (current.y * current.count + y) / (current.count + 1), count: current.count + 1 });
  });
  const height = top + (links.length - 1) * row + 32;
  const label = links.map((link) => `${link.name}, ${link.cycleName}`).join('. ');
  return (
    <svg id="cycle-graph" role="img" viewBox={`0 0 520 ${height}`} aria-label={label}>
      {links.map((link, index) => {
        const y = top + index * row;
        const cycle = placed.get(link.cycleId);
        return (
          <g key={link.id} data-character={link.id} data-cycle={link.cycleId}>
            <line x1="198" y1={y} x2="236" y2={cycle?.y ?? y} />
            <text x="188" y={y} textAnchor="end" dominantBaseline="middle">
              {link.name}
            </text>
          </g>
        );
      })}
      {[...placed.entries()].map(([id, cycle]) => (
        <text key={id} data-cycle-node={id} x="248" y={cycle.y} dominantBaseline="middle">
          {cycle.name}
        </text>
      ))}
    </svg>
  );
}
