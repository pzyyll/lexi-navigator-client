import * as React from "react";
import type { SVGProps } from "react";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
const SvgChatgptLogo = (icon_props) => {
  const { svg_props, ...other_props } = icon_props;
  const props = svg_props;
  return React.createElement(
    SvgIcon,
    other_props,
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={296}
      height={300}
      {...props}
    >
      <image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASgAAAEsCAMAAABHSN49AAADAFBMVEVHcEwAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAAAAAAADR7hC8AAABAHRSTlMABhYuS2qIo7vN3Ofu8/fy7eXZybWdgGFCJhACARIxW4ev z+b0/P/68ODGeU0LDDBlnuz9+eTAjFIiBT+C6/7frGkqCTfHYyEbYLTblUEKK9P78VoTM5HiZy+T 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 TkSuQmCC"
        width={296}
        height={300}
        preserveAspectRatio="none"
      />
    </svg>
  );
};
export default SvgChatgptLogo;