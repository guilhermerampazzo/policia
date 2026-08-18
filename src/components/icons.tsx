const paths: Record<string, string> = {
  home: '<path d="M3 11.2 12 4l9 7.2"/><path d="M5.5 10v9.5h13V10"/><path d="M9.5 19.5v-5h5v5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4"/><path d="M16 3v4"/>',
  book: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M12 4h6.5c.8 0 1.5.7 1.5 1.5v13c0 .8-.7 1.5-1.5 1.5H12"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  chart: '<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16l4-4 3 3 5-6"/>',
  map: '<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>',
  forum: '<circle cx="8" cy="11" r="5"/><path d="M21 13.5a4.5 4.5 0 0 1-4.5 4.5c-.8 0-1.6-.2-2.3-.6"/><path d="M8 6v5"/><path d="M5.5 8.5H10"/>',
  pen: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
  users: '<path d="M17 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 5 18.5V20"/><circle cx="9.5" cy="7.5" r="3.5"/><path d="M19 20v-1.5a3.5 3.5 0 0 0-2.5-3.35"/><path d="M14 4.15a3.5 3.5 0 0 1 0 6.7"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  brain: '<path d="M12 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8V13a3 3 0 0 0 2 2.8V17a3 3 0 0 0 3 3"/><path d="M12 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8V13a3 3 0 0 1-2 2.8V17a3 3 0 0 1-3 3"/><path d="M9 7h.01M15 7h.01M9 13h.01M15 13h.01"/>',
  file: '<path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4"/><path d="M9 12.5h6"/><path d="M9 16h6"/>',
  video: '<rect x="2.5" y="5" width="13" height="14" rx="2"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/>',
  spark: '<path d="M12 2.5c.5 3.6 1.3 5.9 3 7.6 1.7 1.7 4 2.5 7.5 3-3.5.5-5.8 1.3-7.5 3-1.7 1.7-2.5 4-3 7.4-.5-3.5-1.3-5.7-3-7.4-1.7-1.7-4-2.5-7.5-3 3.5-.5 5.8-1.3 7.5-3 1.7-1.7 2.5-4 3-7.6Z"/>',
  warn: '<path d="M12 4.5 21.5 20h-19L12 4.5Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
  chevron: '<path d="M9 18l6-6-6-6"/>',
  download: '<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.7l6 3.3-6 3.3v-6.6Z" fill="currentColor" stroke="none"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6l-5.5 8A2 2 0 0 0 6 20h12a2 2 0 0 0 1.5-3L14 9V3"/><path d="M8 15h8"/>',
  send: '<path d="M4 4.5l16 7.5-16 7.5 3-7.5-3-7.5Z"/><path d="M7 12h13"/>',
  doc: '<path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  arrowRight: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  fire: '<path d="M12 2.5c2 3.5 6 4.5 6 9a6 6 0 0 1-12 0c0-2 1-3.5 2-5 .3 1 1 1.5 2 2-.3-2 .5-4 2-6Z"/>',
};

export function Icon({
  name,
  size = 18,
  className,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: paths[name] ?? paths.grid }}
    />
  );
}
