import React from "react";

const SVG = ({
  children,
  className,
  width = 256,
  height = 256,
  margin = 0,
  setDimensions = false,
  style,
  useRef,
  ...otherProps
}) => (
  <svg
    ref={useRef}
    className={`SVG ${className ? className : ""}`}
    xmlns="http://www.w3.org/2000/svg"
    width={setDimensions ? width : null}
    height={setDimensions ? height : null}
    shapeRendering="optimizeSpeed"
    viewBox={`${(-width / 2) * (1 + margin)} ${(-height / 2) *
      (1 + margin)} ${width * (1 + margin)} ${height * (1 + margin)}`}
    style={style}
    {...otherProps}
  >
    {children}
  </svg>
);

export default SVG;
