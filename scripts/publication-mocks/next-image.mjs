import { createElement } from "react";

export default function Image(props) {
  return createElement("img", {
    src: props.src,
    alt: props.alt ?? "",
    width: props.width,
    height: props.height,
    className: props.className,
  });
}
