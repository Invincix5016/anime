// Misc

export const noop = () => {};
export const pi = Math.PI;
export const minValue = Number.MIN_VALUE;

// Strings

export const emptyString = '';
export const openParenthesisString = '(';
export const closeParenthesisString = ')';
export const closeParenthesisWithSpaceString = ') ';
export const commaString = ',';
export const rgbaString = 'rgba(';
export const hexValuePrefix = '0x';

// Default animation parameters

export const defaultAnimationSettings = {
  update: noop,
  begin: noop,
  loopBegin: noop,
  changeBegin: noop,
  change: noop,
  changeComplete: noop,
  loopComplete: noop,
  complete: noop,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0,
}

export const defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0,
}

// Global settings

export const settings = {
  speed: 1,
  suspendWhenDocumentHidden: true,
}

// Animation type

export const animationTypes = {
  OBJECT: 0,
  ATTRIBUTE: 1,
  CSS: 2,
  TRANSFORM: 3,
}

export const valueTypes = {
  NUMBER: 0,
  UNIT: 1,
  COLOR: 2,
  PATH: 3,
  COMPLEX: 4,
}

// Transforms

export const validTransforms = [
  'translateX',
  'translateY',
  'translateZ',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skew',
  'skewX',
  'skewY',
  'perspective',
  'matrix',
  'matrix3d',
];

export const transformsFragmentStrings = validTransforms.reduce((a, v) => ({ ...a, [v]: v + openParenthesisString}), {});

// Regex

export const hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
export const rgbTestRgx = /^rgb/i;
export const hslTestRgx = /^hsl/i;
export const rgbExecRgx = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
export const rgbaExecRgx = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
export const hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
export const hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
export const springTestRgx = /^spring/;
export const easingsExecRgx = /\(([^)]+)\)/;
export const digitWithExponentRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
export const unitsExecRgx = /^([+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)+(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)$/;
export const lowerCaseRgx = /([a-z])([A-Z])/g;
export const lowerCaseRgxParam = '$1-$2';
export const transformsExecRgx = /(\w+)\(([^)]*)\)/g;
export const relativeValuesExecRgx = /^(\*=|\+=|-=)/;
