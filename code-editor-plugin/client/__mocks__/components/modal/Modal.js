import React from 'react';
import classNames from 'classnames';
export function Modal(props) {

  const {
    children,
    relativePos
  } = props;

  let style = {};


  if (relativePos) {
    style = {
      'position': 'relative',
      ...style
    };
  }

  return (
    <div
      style={ style }
    >
      { children }
    </div>
  );
}

Modal.Title = Title;
Modal.Body = Body;
Modal.Footer = Footer;

function Title(props) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <div className={ classNames('overlay__header', className) } { ...rest }>
      <h1 className="overlay__title">
        { children }
      </h1>
    </div>
  );
}

function Body(props) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <div className={ classNames('overlay__body', className) } { ...rest }>
      { children }
    </div>
  );
}

function Footer(props) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <div className={ classNames('overlay__footer', className) } { ...rest }>
      { props.children }
    </div>
  );
}
