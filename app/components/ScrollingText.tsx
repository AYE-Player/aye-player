import React, { useEffect } from "react";

interface IScrollingTextProps {
  scrollId: string;
  children: any;
  textOffset?: number;
  speed?: number;
  scrollCount?: number;
}

const ScrollingText: React.FunctionComponent<IScrollingTextProps> = props => {
  let animationFrame: number;
  let container: HTMLElement;
  let content: HTMLElement;
  let marquee: Element;
  let clone: Node;

  useEffect(() => {
    prepareScrollingElements();

    marquee.addEventListener(
      "mouseenter",
      event => {
        event.preventDefault();
        if (animationFrame) return;
        console.log("MOUSEenter ID", props.scrollId);
        scrollingTextEffect();
      },
      true
    );

    marquee.addEventListener(
      "mouseover",
      event => {
        event.preventDefault();
        if (animationFrame) return;
        console.log("MOUSEover ID", props.scrollId);
        scrollingTextEffect();
      },
      true
    );

    return () => {
      marquee.removeEventListener(
        "mouseenter",
        event => {
          event.preventDefault();
          if (animationFrame) return;
          console.log("MOUSEenter ID", props.scrollId);
          scrollingTextEffect();
        },
        true
      );
      marquee.removeEventListener(
        "mouseover",
        event => {
          event.preventDefault();

          if (animationFrame) return;
          console.log("MOUSEover ID", props.scrollId);
          scrollingTextEffect();
        },
        true
      );
    };
  });

  const prepareScrollingElements = () => {
    marquee = document.querySelectorAll(`#${props.scrollId}`)[0];

    container = marquee.querySelector(".inner") as HTMLElement;
    content = marquee.querySelector(".inner > *") as HTMLElement;

    //Duplicate content
    clone = content.cloneNode(true);
    container.appendChild(clone);

    content.style.marginRight = `${props.textOffset}px`;
  };

  const scrollingTextEffect = () => {
    const elWidth = content.offsetWidth;
    let progress = 1;
    let animationCount = 0;

    const loop = () => {
      progress = progress - props.speed;
      if (progress <= (elWidth + props.textOffset) * -1) {
        progress = 0;
        animationCount++;
        if (animationCount === props.scrollCount) {
          resetAnimation();
          animationCount = 0;
          return;
        }
      }

      container.style.transform = "translateX(" + progress + "px)";
      container.style.transform += "skewX(" + props.speed * 0.4 + "deg)";

      animationFrame = window.requestAnimationFrame(loop);
    };
    loop();
  };

  const resetAnimation = () => {
    window.cancelAnimationFrame(animationFrame);

    const reset = () => {
      container.style.transform = "translateX(0px) skewX(0deg)";
    };
    window.requestAnimationFrame(reset);
    animationFrame = undefined;
  };

  return (
    <div
      style={{
        overflow: "hidden"
      }}
    >
      <div
        className="inner"
        style={{
          position: "relative",
          width: "400%",
          display: "flex"
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

ScrollingText.defaultProps = {
  scrollCount: 3,
  speed: 0.5,
  textOffset: 64
} as Partial<IScrollingTextProps>;

export default ScrollingText;
