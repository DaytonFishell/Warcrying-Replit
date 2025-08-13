import { memo } from 'react';
import FighterCard from '@/components/FighterCard';
import { Fighter } from '@shared/schema';

interface MemoizedFighterCardProps {
  fighter: Fighter;
  onClick?: () => void;
  showEditDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const MemoizedFighterCard = memo(function MemoizedFighterCard(props: MemoizedFighterCardProps) {
  return <FighterCard {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.fighter.id === nextProps.fighter.id &&
    prevProps.fighter.name === nextProps.fighter.name &&
    prevProps.fighter.wounds === nextProps.fighter.wounds &&
    prevProps.fighter.battles === nextProps.fighter.battles &&
    prevProps.fighter.kills === nextProps.fighter.kills &&
    prevProps.fighter.deaths === nextProps.fighter.deaths &&
    prevProps.showEditDelete === nextProps.showEditDelete
  );
});

export default MemoizedFighterCard;