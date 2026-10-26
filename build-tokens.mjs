import StyleDictionary from 'style-dictionary';

// Helper: convert string to kebab-case handling camelCase and spaces
function toKebabCase(str) {
  return str
    .toString()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

// 1. Shadow Transform: formats custom-shadow to CSS box-shadow
StyleDictionary.registerTransform({
  name: 'custom/shadow/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.type === 'custom-shadow',
  transform: (token) => {
    const { offsetX = 0, offsetY = 0, radius = 0, spread = 0, color = '#000000' } = token.value;
    let colorStr = color;
    if (typeof color === 'string' && color.startsWith('#') && color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a = Math.round((parseInt(color.slice(7, 9), 16) / 255) * 100) / 100;
      colorStr = `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    const x = offsetX === 0 ? '0' : `${offsetX}px`;
    const y = offsetY === 0 ? '0' : `${offsetY}px`;
    const blur = radius === 0 ? '0' : `${radius}px`;
    const sp = spread === 0 ? '0' : `${spread}px`;
    return `${x} ${y} ${blur} ${sp} ${colorStr}`;
  }
});

// 2. Font Shorthand Transform: formats custom-fontStyle to CSS font shorthand
StyleDictionary.registerTransform({
  name: 'custom/font/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.type === 'custom-fontStyle',
  transform: (token) => {
    const {
      fontSize,
      lineHeight,
      fontFamily,
      fontWeight = 400,
      fontStyle = 'normal'
    } = token.value;
    const stylePart = fontStyle !== 'normal' ? `${fontStyle} ` : '';
    const family = fontFamily ? `'${fontFamily}', sans-serif` : 'sans-serif';
    return `${stylePart}${fontWeight} ${fontSize}px/${lineHeight}px ${family}`;
  }
});

// 3. Dimension in px Transform
StyleDictionary.registerTransform({
  name: 'custom/size/px',
  type: 'value',
  transitive: true,
  filter: (token) => {
    return token.type === 'dimension' || 
           token.path.includes('fontSize') || 
           token.path.includes('lineHeight') ||
           token.path.includes('letterSpacing') ||
           token.path.includes('paragraphIndent') ||
           token.path.includes('paragraphSpacing');
  },
  transform: (token) => {
    const val = token.value;
    if (typeof val === 'number') {
      return val === 0 ? '0' : `${val}px`;
    }
    return val;
  }
});

// 4. FontFamily Transform
StyleDictionary.registerTransform({
  name: 'custom/fontFamily/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.path.includes('fontFamily'),
  transform: (token) => {
    const val = token.value;
    if (typeof val === 'string') {
      return `'${val}', sans-serif`;
    }
    return val;
  }
});

// 5. Clean Color Transform: convert 8-digit hex (#rrggbbaaff) to 6-digit hex (#rrggbb)
StyleDictionary.registerTransform({
  name: 'custom/color/css',
  type: 'value',
  transitive: true,
  filter: (token) => token.type === 'color',
  transform: (token) => {
    const val = token.value;
    if (typeof val === 'string' && val.startsWith('#') && val.length === 9) {
      if (val.slice(7, 9).toLowerCase() === 'ff') {
        return val.slice(0, 7).toLowerCase();
      }
      const r = parseInt(val.slice(1, 3), 16);
      const g = parseInt(val.slice(3, 5), 16);
      const b = parseInt(val.slice(5, 7), 16);
      const a = Math.round((parseInt(val.slice(7, 9), 16) / 255) * 100) / 100;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return val;
  }
});

// 6. Clean Kebab Name Transform (removes redundant path segments like spacing.spacing and converts camelCase)
StyleDictionary.registerTransform({
  name: 'custom/name/kebab',
  type: 'name',
  transform: (token) => {
    const path = [...token.path];
    const cleanedPath = [];
    for (let i = 0; i < path.length; i++) {
      if (i > 0 && path[i] === path[i - 1]) {
        continue; // skip duplicate consecutive segment
      }
      cleanedPath.push(path[i]);
    }
    return cleanedPath
      .map(part => toKebabCase(part))
      .filter(Boolean)
      .join('-');
  }
});

// 7. Structured CSS Variables Format with Root Selector and Clean Comments
StyleDictionary.registerFormat({
  name: 'custom/css/root-variables',
  format: ({ dictionary }) => {
    const categories = {
      colors: { title: 'Colors', tokens: [] },
      spacing: { title: 'Spacing', tokens: [] },
      effect: { title: 'Box Shadows / Effects', tokens: [] },
      font: { title: 'Font Styles (Shorthand)', tokens: [] },
      typography: { title: 'Typography (Granular Properties)', tokens: [] }
    };

    const uncategorized = [];

    dictionary.allTokens.forEach((token) => {
      const topCat = token.path[0];
      if (categories[topCat]) {
        categories[topCat].tokens.push(token);
      } else {
        uncategorized.push(token);
      }
    });

    const lines = [
      '/**',
      ' * Do not edit directly, this file was auto-generated by Style Dictionary.',
      ' */',
      '',
      ':root {'
    ];

    for (const [, group] of Object.entries(categories)) {
      if (group.tokens.length > 0) {
        lines.push(`  /* ${group.title} */`);
        group.tokens.forEach((token) => {
          lines.push(`  --${token.name}: ${token.value};`);
        });
        lines.push('');
      }
    }

    if (uncategorized.length > 0) {
      lines.push('  /* Other Tokens */');
      uncategorized.forEach((token) => {
        lines.push(`  --${token.name}: ${token.value};`);
      });
      lines.push('');
    }

    if (lines[lines.length - 1] === '') {
      lines.pop();
    }

    lines.push('}');
    lines.push('');
    return lines.join('\n');
  }
});

// Configure and build Style Dictionary
const sd = new StyleDictionary({
  source: ['tokens.json'],
  platforms: {
    css: {
      transforms: [
        'custom/name/kebab',
        'custom/color/css',
        'custom/shadow/css',
        'custom/font/css',
        'custom/size/px',
        'custom/fontFamily/css'
      ],
      buildPath: './',
      files: [{
        destination: 'tokens.css',
        format: 'custom/css/root-variables'
      }]
    }
  }
});

await sd.buildAllPlatforms();
console.log('Successfully generated tokens.css using Style Dictionary');
