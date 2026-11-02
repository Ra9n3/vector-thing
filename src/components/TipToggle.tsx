import { ToggleButton, Tooltip } from '@mui/material';
import type { ToggleButtonProps } from '@mui/material';

interface Props extends ToggleButtonProps {
  tip: string;
}

// ToggleButton with a tooltip that also works while the button is disabled.
export function TipToggle({ tip, ...props }: Props) {
  return (
    <Tooltip title={tip}>
      <span style={{ display: 'inline-flex', minWidth: 0 }}>
        <ToggleButton aria-label={tip} {...props} />
      </span>
    </Tooltip>
  );
}
