import React, { useState } from 'react';

const Tooltip = ({ delay, content, direction, children }) => {
  let timeout;
  const [ active, setActive ] = useState(false);

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setActive(true);
    }, delay || 400);
  };

  const hideTooltip = () => {
    clearInterval(timeout);
    setActive(false);
  };

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={ showTooltip }
      onMouseLeave={ hideTooltip }
    >
      {children}
      {active && (
        <div className={ `tooltip-indicator ${direction || 'top'}` }>
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
