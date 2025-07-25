import { IconLogo, IconLogoDark } from '@/components/ui/icon';
import { useTheme } from 'next-themes';

export const SiteLogo = (props: { className?: string; size?: number }) => {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === 'dark') {
    return <IconLogoDark {...props} />;
  }
  return <IconLogo {...props} />;
};

export const LoadingSiteLogo = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => {
  const { resolvedTheme } = useTheme();
  const currentColor =
    resolvedTheme === 'dark'
      ? 'rgba(255, 255, 255, :opacity)'
      : 'rgba(26, 26, 26, :opacity)';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40.62 33.29"
      width={size}
      height={size}
      className={className}
    >
      <path
        fill={currentColor.replace(':opacity', '1')}
        d="M12.77.8c-.44-.51-1.07-.8-1.74-.8H1.32l13.61,15.88L0,33.29h9.72c.67,0,1.31-.29,1.74-.8l8.85-10.33,8.85,10.33c.44.51,1.07.8,1.74.8h9.72L12.77.8Z"
      />
      <path
        d="M32.15,8.35L39.3,0h-9.26c-.96,0-1.87.42-2.49,1.15l-7.15,8.34h9.24c.96.01,1.87-.41,2.5-1.14Z"
        className="fill-primary animate-pulse"
      />
    </svg>
  );
};
