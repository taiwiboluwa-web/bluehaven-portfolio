export function shouldPollAdmin({ busy, expanded }: { busy: boolean; expanded: string | null }) {
  return !busy && expanded === null;
}
