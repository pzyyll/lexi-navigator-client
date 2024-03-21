const template = (variables, { tpl }) => {
  const { imports, interfaces, componentName, props, jsx, exports } = variables;
  return tpl`
  ${imports};
  import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
  ${interfaces};
  
  const ${componentName} = (icon_props) => {
    const { svg_props, ...other_props } = icon_props;
    const props = svg_props;
    return React.createElement(SvgIcon, other_props, ${jsx})
  };
  
  ${exports};
  `;
};

module.exports = template;
