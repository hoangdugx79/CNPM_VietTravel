import { statusBadge } from '../../../lib/format';

export default function AdminStatusBadge({ status }) {
  const { color, label } = statusBadge(status);
  return <span className={`badge badge-${color}`}>{label}</span>;
}
