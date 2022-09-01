import {
  validTransforms,
  animationTypes,
  valueTypes,
  emptyString,
  relativeValuesExecRgx,
  digitWithExponentRgx,
  unitsExecRgx,
} from './consts.js';

import {
  cache,
} from './cache.js';

import {
  is,
  arrayContains,
} from './utils.js';

import {
  convertValueUnit,
} from './units.js';

import {
  getTransformValue,
} from './transforms.js';

import {
  parseTargets,
  getAnimatables,
} from './animatables.js';

import {
  isValidSVGAttribute,
} from './svg.js';

import {
  convertColorStringValuesToRgbaArray
} from './colors.js';

export function getFunctionValue(functionValue, target, index, total) {
  if (!is.fnc(functionValue)) return functionValue;
  return functionValue(target, index, total) || 0; // Fallback to 0 if the function results in undefined / NaN / null
}

export function getAnimationType(target, prop) {
  const cachedDOMElement = cache.DOM.get(target);
  if (!cachedDOMElement) {
    return animationTypes.OBJECT;
  } else {
    if (!is.nil(target.getAttribute(prop)) || (cachedDOMElement.isSVG && isValidSVGAttribute(target, prop))) return animationTypes.ATTRIBUTE; // Handle DOM and SVG attributes
    if (arrayContains(validTransforms, prop)) return animationTypes.TRANSFORM; // Handle CSS Transform properties differently than CSS to allow individual animations
    if (prop in target.style) return animationTypes.CSS; // All other CSS properties
    if (!is.und(target[prop])) return animationTypes.OBJECT; // Handle DOM element properies that can't be accessed using getAttribute()
    return console.warn(`Can't find property '${prop}' on target '${target}'.`);
  }
  return console.warn(`Target '${target}' can't be animated.`);
}

export function getOriginalAnimatableValue(target, propName, animationType) {
  const animType = is.num(animationType) ? animationType : getAnimationType(target, propName);
  // if (animType === animationTypes.CSS) console.log(target);
  switch (animType) {
    case animationTypes.OBJECT: return target[propName] || 0; // Fallaback to 0 if the property doesn't exist on the object.
    case animationTypes.ATTRIBUTE: return target.getAttribute(propName);
    case animationTypes.TRANSFORM: return getTransformValue(target, propName, true);
    case animationTypes.CSS: return target.style[propName] || getComputedStyle(target).getPropertyValue(propName);
  }
}

export function getRelativeValue(x, y, operator) {
  switch (operator) {
    case '+': return x + y;
    case '-': return x - y;
    case '*': return x * y;
  }
}

export function decomposeValue(rawValue) {
  let val = rawValue;
  const value = {
    type: valueTypes.NUMBER,
  };
  const numberedVal = +val;
  if (!isNaN(numberedVal)) {
    value.number = numberedVal;
    return value;
  } else if (rawValue.isPath) {
    value.type = valueTypes.PATH;
    value.path = rawValue;
    value.number = value.path.totalLength;
    value.unit = emptyString;
    return value;
  } else {
    const operatorMatch = relativeValuesExecRgx.exec(val);
    if (operatorMatch) {
      val = val.slice(2);
      value.operator = operatorMatch[0][0];
    }
    const unitMatch = unitsExecRgx.exec(val);
    if (unitMatch) {
      value.type = valueTypes.UNIT;
      value.number = +unitMatch[1];
      value.unit = unitMatch[2];
      return value;
    } else if (value.operator) {
      value.number = +val;
      return value;
    } else if (is.col(val)) {
      value.type = valueTypes.COLOR;
      value.numbers = convertColorStringValuesToRgbaArray(val);
      return value;
    } else {
      const stringifiedVal = val + emptyString;
      const matchedNumbers = stringifiedVal.match(digitWithExponentRgx);
      value.type = valueTypes.COMPLEX;
      value.numbers = matchedNumbers ? matchedNumbers.map(Number) : [];
      value.strings = stringifiedVal.split(digitWithExponentRgx) || [];
      return value;
    }
  }
}

export function getTargetValue(targetSelector, propName, unit) {
  const [target] = getAnimatables(targetSelector);
  if (target) {
    let value = getOriginalAnimatableValue(target, propName);
    if (unit) {
      const decomposedValue = decomposeValue(value);
      if (decomposedValue.type === valueTypes.NUMBER || decomposedValue.type === valueTypes.UNIT) {
        const convertedValue = convertValueUnit(target, decomposedValue, unit);
        value = convertedValue.number + convertedValue.unit;
      }
    }
    return value;
  }
}
