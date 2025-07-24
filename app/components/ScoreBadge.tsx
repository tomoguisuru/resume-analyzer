interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'small' | 'medium' | 'large';
}

export function ScoreBadge({ score, size = 'medium' }: ScoreBadgeProps) {
  const getBadgeConfig = (score: number) => {
    if (score > 70) {
      return {
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-600',
        label: 'Strong'
      };
    } else if (score > 49) {
      return {
        backgroundColor: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        label: 'Good Start'
      };
    } else {
      return {
        backgroundColor: 'bg-red-100',
        textColor: 'text-red-600',
        label: 'Needs Work'
      };
    }
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const { backgroundColor, textColor, label } = getBadgeConfig(score);

  return (
    <div
      className={`inline-flex rounded-full font-medium ${backgroundColor} ${textColor} ${sizeClasses[size]}`}
    >
      <p className="leading-none">{label}</p>
    </div>
  );
};
