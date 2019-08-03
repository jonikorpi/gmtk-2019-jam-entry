import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";

import Sprite from "./Sprite.js";
const { max, min, round, floor, ceil, random } = Math;

const World = () => {
  useEffect(() => {
    const baseAngle = 12;
    const angle = 40;
    const closeZoom = 0;
    const farZoom = -1500;
    let frame, zoomer, lastZoom;
    let scrollable = 0;
    let viewportLength = 0;

    const moveCamera = () => {
      const scrolled = window.pageYOffset;
      // const scrolled = window.pageXOffset;
      zoomer = zoomer || document.getElementById("zoomer");
      const zoom = max(0, scrolled / scrollable);

      if (zoom !== lastZoom) {
        zoomer.style.setProperty(
          "transform",
          `translateZ(${closeZoom + zoom * farZoom}vh) translateY(${(1 - zoom) * -2}vh) rotateX(${baseAngle +
            (1 - zoom) * angle}deg)`
          // `translateZ(${closeZoom}vh) rotateX(${baseAngle + angle}deg) rotateZ(${((scrolled % (viewportLength * 2)) /
          //   (viewportLength * 2)) *
          //   -360}deg)`
        );
        lastZoom = zoom;
      }

      frame = null;
    };

    const handleCamera = () => (frame = frame || requestAnimationFrame(moveCamera));
    const handleResize = () => {
      viewportLength = window.innerHeight;
      scrollable = document.documentElement.scrollHeight - viewportLength;
      // viewportLength = window.innerWidth;
      // scrollable = document.documentElement.scrollWidth - viewportLength;
      handleCamera();
    };

    window.addEventListener("scroll", handleCamera);
    window.addEventListener("resize", handleResize);

    handleResize();
    window.scrollTo(scrollable / 2, 0);

    return () => {
      window.removeEventListener("scroll", handleCamera);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // const handleMove = ({ x, y }) => {
  //   document.getElementById("translator").style.setProperty("transform", `translate3d(${-x * 10}vh, ${-y * 10}vh, 0)`);
  // };

  return (
    <Fragment>
      <div id="scrollArea" />
      <div id="world">
        <div id="zoomer">
          <div id="translator">
            <Sprite />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default World;
