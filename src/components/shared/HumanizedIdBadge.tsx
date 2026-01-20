import { useHumanizedAssetIds } from '@/hooks/useHumanizedAssetIds';
import { Badge } from '@/components/ui/badge';

interface HumanizedIdBadgeProps {
  assetId: string;
  category: string;
  humanizedId?: string;
  className?: string;
}

export const HumanizedIdBadge = ({
  assetId,
  category,
  humanizedId,
  className,
}: HumanizedIdBadgeProps) => {
  const { getHumanizedId, CATEGORY_PREFIXES } = useHumanizedAssetIds();
  
  const displayId = humanizedId || getHumanizedId(assetId);
  const prefix = CATEGORY_PREFIXES[category] || 'OTH';
  
  // Determinar cor baseada na categoria
  const colorMap: Record<string, string> = {
    'notebook': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'desktop': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'servidor': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'monitor': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'impressora': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'router': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'switch': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'outro': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  
  const color = colorMap[category] || colorMap['outro'];
  
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Badge 
        variant="outline" 
        className={`font-mono font-bold text-sm ${color} border-0`}
      >
        <span className="mr-1">{prefix}</span>
        <span>{displayId.replace(prefix, '')}</span>
      </Badge>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        ({category})
      </span>
    </div>
  );
};
