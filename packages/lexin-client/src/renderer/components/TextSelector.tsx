import React from "react";

interface Props {
  onSelect: (text: string, point: DOMPoint) => void;
}

export default function TextSelector(props: Props) {
  const { onSelect } = props;
  React.useEffect(() => {
    const handleTextSelection = (e: MouseEvent) => {
      const selection = window.getSelection();
        const text = selection?.toString();
        if (text) {
          const point = new DOMPoint(e.clientX, e.clientY);
          onSelect && onSelect(text, point);
        }
    };

    document.addEventListener("mouseup", handleTextSelection);

    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

  return <div></div>;
}
