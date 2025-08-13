import { memo } from 'react';
import WarbandCard from '@/components/WarbandCard';
import { Warband } from '@shared/schema';

interface MemoizedWarbandCardProps {
  warband: Warband;
  onClick?: () => void;
  showEditDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MemoizedWarbandCard = memo(function MemoizedWarbandCard(props: MemoizedWarbandCardProps) {
  return <WarbandCard {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.warband.id === nextProps.warband.id &&
    prevProps.warband.name === nextProps.warband.name &&
    prevProps.warband.faction === nextProps.warband.faction &&
    prevProps.warband.currentPoints === nextProps.warband.currentPoints &&
    prevProps.warband.pointsLimit === nextProps.warband.pointsLimit &&
    prevProps.showEditDelete === nextProps.showEditDelete
  );
});

export default MemoizedWarbandCard;