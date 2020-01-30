import React, { useEffect } from "react";

interface IScrollingTextProps {
  scrollId: string;
  children: any;
}

const ScrollingText: React.FunctionComponent<IScrollingTextProps> = props => {
  let animationFrame: number;
  let container: HTMLElement;
  let content: HTMLElement;
  let marquee: Element;
  let clone: Node;
  let mouseEntered = false;
  let mouseLeft = false;

  useEffect(() => {
    // pixel offset for the text clone
    const textSpacer = 64;

    prepareScrollingElements(textSpacer);

    marquee.addEventListener(
      "mouseenter",
      event => {
        event.preventDefault();
        if (!mouseEntered) {
          mouseEntered = true;
          mouseLeft = false;
          console.log("MOUSEenter ID", props.scrollId);
          scrollingTextEffect(textSpacer);
        }
      },
      true
    );

    marquee.addEventListener(
      "mouseover",
      event => {
        event.preventDefault();
        if (!mouseEntered) {
          mouseEntered = true;
          mouseLeft = false;
          console.log("MOUSEover ID", props.scrollId);
          scrollingTextEffect(textSpacer);
        }
      },
      true
    );

    marquee.addEventListener(
      "mouseleave",
      event => {
        event.preventDefault();
        if (!mouseLeft) {
          mouseLeft = true;
          mouseEntered = false;
          console.log("MOUSEleave ID", props.scrollId);
        }
        //resetAnimation();
      },
      true
    );

    return () => {
      marquee.removeEventListener(
        "mouseenter",
        event => {
          event.preventDefault();
          if (!mouseEntered) {
            mouseEntered = true;
            console.log("MOUSEenter ID", props.scrollId);
            scrollingTextEffect(textSpacer);
          }
        },
        true
      );
      marquee.removeEventListener(
        "mouseover",
        event => {
          event.preventDefault();
          if (!mouseEntered) {
            mouseEntered = true;
            console.log("MOUSEover ID", props.scrollId);
            scrollingTextEffect(textSpacer);
          }
        },
        true
      );
      marquee.removeEventListener(
        "mouseleave",
        event => {
          event.preventDefault();
          console.log("MOUSEleave ID", props.scrollId);
          resetAnimation();
        },
        true
      );
    };
  });

  const prepareScrollingElements = (textSpacer: number) => {
    marquee = document.querySelectorAll(`#${props.scrollId}`)[0];

    container = marquee.querySelector(".inner") as HTMLElement;
    content = marquee.querySelector(".inner > *") as HTMLElement;

    //Duplicate content
    clone = content.cloneNode(true);
    container.appendChild(clone);

    content.style.marginRight = `${textSpacer}px`;
  };

  const scrollingTextEffect = (textSpacer: number) => {
    const speed = 0.5;
    const elWidth = content.offsetWidth;
    let progress = 1;
    let animationCount = 0;

    const loop = () => {
      if (animationCount === 3) {
        resetAnimation();
      }
      progress = progress - speed;
      if (progress <= (elWidth + textSpacer) * -1) {
        progress = 0;
        animationCount++;
      }

      container.style.transform = "translateX(" + progress + "px)";
      container.style.transform += "skewX(" + speed * 0.4 + "deg)";

      animationFrame = window.requestAnimationFrame(loop);
    };
    loop();
  };

  const resetAnimation = () => {
    window.cancelAnimationFrame(animationFrame);
    container.removeChild(clone);

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

export default ScrollingText;
