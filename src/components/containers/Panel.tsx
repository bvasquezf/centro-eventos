import { usePanel } from '../../lib/usePanel';
import PanelView from '../ui/PanelView';
export default function Panel() { return <PanelView {...usePanel()} />; }
