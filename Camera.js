import { h, Fragment } from "preact";
import { useEffect } from "preact/hooks";

import { useDatabase } from "./firebase";
import { unit } from "./World";
import { pointyToPixel } from "./hexes";
const { max } = Math;

const Camera = ({ uid, children, style }) => {
  useEffect(() => {
    const baseAngle = 10;
    const angle = 16;
    const closeZoom = 50;
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
          `translateZ(${closeZoom + zoom * farZoom}vh) translateY(${(1 - zoom * zoom) * -5}vh) rotateX(${baseAngle +
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

  const { x = 0, y = 0 } = useDatabase(`players/${uid}/public`) || {};
  useEffect(() => {
    const [px, py] = pointyToPixel([x, y]);
    document
      .getElementById("translator")
      .style.setProperty("transform", `translate3d(${-px * unit}vh, ${-py * unit}vh, 0)`);
  }, [x, y]);

  return (
    <Fragment>
      <div id="scrollArea" />
      <div id="world" style={style}>
        <div id="zoomer">
          <div id="translator">{children}</div>
        </div>
      </div>
    </Fragment>
  );
};

export default Camera;
