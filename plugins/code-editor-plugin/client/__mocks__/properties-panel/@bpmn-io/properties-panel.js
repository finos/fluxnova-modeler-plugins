import React from 'react';

export const TextFieldEntry = React.forwardRef((props, ref) => (
  <input ref={ ref } data-testid="text-field-entry" disabled={ props.disabled } />
));

TextFieldEntry.displayName = 'TextFieldEntry';