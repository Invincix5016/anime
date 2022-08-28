import {
  valueTypes,
  animationTypes,
  minValue,
} from './consts.js';

import {
  cache,
} from './cache.js';

import {
  is,
  round,
} from './utils.js';

import {
  parseEasings,
} from './easings.js';

import {
  getRelativeValue,
  getFunctionValue,
  getOriginalAnimatableValue,
  decomposeValue,
} from './values.js';

import {
  convertValueUnit,
} from './units.js';

// Tweens

let tweenId = 0;

export function convertKeyframesToTweens(keyframes, target, propertyName, animationType, index, total, groupId) {
  let prevTween;
  const tweens = [];

  for (let i = 0, l = keyframes.length; i < l; i++) {

    const tween = {};

    for (let key in keyframes[i]) {
      let prop = getFunctionValue(keyframes[i][key], target, index, total);
      if (is.arr(prop)) {
        prop = prop.map(v => getFunctionValue(v, target, index, total));
        if (prop.length === 1) {
          prop = prop[0];
        }
      }
      tween[key] = prop;
    }

    const tweenValue = tween.value;
    const originalValue = decomposeValue(getOriginalAnimatableValue(target, propertyName, animationType));
    let from, to;

    // Decompose values
    if (is.arr(tweenValue)) {
      from = decomposeValue(tweenValue[0]);
      to = decomposeValue(tweenValue[1]);
      if (from.type === valueTypes.NUMBER) {
        if (prevTween) {
          if (prevTween.to.type === valueTypes.UNIT) {
            from.type = valueTypes.UNIT;
            from.unit = prevTween.to.unit;
          }
        } else {
          if (originalValue.type === valueTypes.UNIT) {
            from.type = valueTypes.UNIT;
            from.unit = originalValue.unit;
          }
        }
      }
    } else {
      if (!is.und(tweenValue)) {
        to = decomposeValue(tweenValue);
      } else if (prevTween) {
        to = {...prevTween.to};
      }
      if (prevTween) {
        from = {...prevTween.to};
      } else {
        from = {...originalValue};
        if (is.und(to)) {
          to = {...originalValue};
        }
      }
    }

    // Apply operators
    if (from.operator) {
      from.number = getRelativeValue(!prevTween ? originalValue.number : prevTween.to.number, from.number, from.operator);
    }
    if (to.operator) {
      to.number = getRelativeValue(from.number, to.number, to.operator);
    }

    // Values omogenisation in cases of type difference between "from" and "to"
    if (from.type !== to.type) {
      if (from.type === valueTypes.COMPLEX || to.type === valueTypes.COMPLEX) {
        const complexValue = from.type === valueTypes.COMPLEX ? from : to;
        const notComplexValue = from.type === valueTypes.COMPLEX ? to : from;
        notComplexValue.type = valueTypes.COMPLEX;
        notComplexValue.strings = complexValue.strings;
        notComplexValue.numbers = [notComplexValue.number];
      } else if (from.type === valueTypes.UNIT && to.type === valueTypes.PATH) {
        to.unit = from.unit;
      } else if (from.type === valueTypes.UNIT || to.type === valueTypes.UNIT) {
        const unitValue = from.type === valueTypes.UNIT ? from : to;
        const notUnitValue = from.type === valueTypes.UNIT ? to : from;
        notUnitValue.type = valueTypes.UNIT;
        notUnitValue.unit = unitValue.unit;
      } else if (from.type === valueTypes.COLOR || to.type === valueTypes.COLOR) {
        const colorValue = from.type === valueTypes.COLOR ? from : to;
        const notColorValue = from.type === valueTypes.COLOR ? to : from;
        notColorValue.type = valueTypes.COLOR;
        notColorValue.strings = colorValue.strings;
        notColorValue.numbers = [0, 0, 0, 0];
      }
    }

    // Unit conversion
    if (from.unit !== to.unit) {
      const valueToConvert = to.unit ? from : to;
      const unitToConvertTo = to.unit ? to.unit : from.unit;
      convertValueUnit(target, valueToConvert, unitToConvertTo);
    }

    // Default to 0 for non existing complex values
    if (to.numbers && from.numbers && (to.numbers.length !== from.numbers.length)) {
      to.numbers.forEach((number, i) => from.numbers[i] = 0);
      to.strings.forEach((string, i) => from.strings[i] = string);
    }

    // Check if target is a children of an SVG element for path animation
    if (to.type === valueTypes.PATH) {
      const cached = cache.DOM.get(target);
      if (cached) to.path.isTargetInsideSVG = cached.isSVG;
    }

    // Reference the cached transforms here to avoid unnecessary call to .get() during render

    if (animationType === animationTypes.TRANSFORM) {
      tween.cachedTransforms = cache.DOM.get(target).transforms;
    }

    tween.id = tweenId++;
    tween.groupId = groupId;
    tween.type = animationType;
    tween.property = propertyName;
    tween.target = target;
    tween.from = from;
    tween.to = to;
    tween.duration = parseFloat(tween.duration) || minValue;
    tween.delay = parseFloat(tween.delay);
    tween.start = prevTween ? prevTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.progress = 0;
    tween.currentValue = 0;
    prevTween = tween;
    tweens.push(tween);
  }

  return tweens;
}

export function getTweenProgress(fromNumber, toNumber, progressValue, roundValue) {
  let value = fromNumber + (progressValue * (toNumber - fromNumber));
  return !roundValue ? value : round(value, roundValue);
}
