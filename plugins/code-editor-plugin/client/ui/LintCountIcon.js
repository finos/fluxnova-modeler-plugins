import Info from '../resources/icons/Info.svg';
import Warning from '../resources/icons/Warning.svg';
import Error from '../resources/icons/Error.svg';
import Success from '../resources/icons/Success.svg';

const iconMap = {
  info: Info,
  warning: Warning,
  error: Error,
  success: Success,
};

const LintCountIcon = ({ severity, value }) => {
  const Icon = iconMap[severity?.toLowerCase()] || Error;
  return (
    <div className="lint-count-icon">
      <Icon className={ `${severity?.toLowerCase()}` } />
      <span>{value}</span>
    </div>
  );
};

export default LintCountIcon;