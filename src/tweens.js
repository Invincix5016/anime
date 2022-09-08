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

export function convertKeyframesToTweens(animation, keyframes, target, targetPropertyTweens, propertyName, animationType, index) {
  let prevTween;
  const tweens = [];
  const total = animation.targets.size;
  const timelineOffset = animation.timelineOffset;
  const isOrphan = animation._isOrphan;

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
    tween.canRender = 1;
    tween.type = animationType;
    tween.property = propertyName;
    tween.target = target;
    tween.from = from;
    tween.to = to;
    tween.timelineOffset = timelineOffset;
    tween.updateDuration = parseFloat(tween.duration) || minValue;
    tween.changeDuration = tween.updateDuration;
    tween.duration = tween.delay + tween.changeDuration + tween.endDelay;
    tween.delay = parseFloat(tween.delay);
    tween.start = prevTween ? prevTween.end : 0;
    tween.end = tween.start + tween.duration;
    tween.absoluteStart = timelineOffset + tween.start;
    tween.absoluteEnd = timelineOffset + tween.end;
    tween.easing = parseEasings(tween.easing, tween.updateDuration);

    tween._changeStartTime = tween.start + tween.delay;
    tween._changeEndTime = tween.end - tween.endDelay;

    tween.absoluteChangeStart = timelineOffset + tween._changeStartTime;
    tween.absoluteChangeEnd = timelineOffset + tween._changeEndTime;

    let tweenIndex = 0;
    while (tweenIndex < targetPropertyTweens.length && (targetPropertyTweens[tweenIndex].absoluteStart - tween.absoluteStart) < 0) tweenIndex++;
    targetPropertyTweens.splice(tweenIndex, 0, tween);

    let parentPreviousSiblingTween;
    let parentPreviousSiblingTweenAbsoluteEnd = 0;
    animation.parent.children.forEach(children => {
      const siblingsTarget = children.targets.get(target);
      if (siblingsTarget) {
        const siblingsTweens = siblingsTarget[propertyName];
        if (siblingsTweens) {
          let siblingTweenIndex = 0;
          // siblingsTweens.forEach(sibling => {
          //   console.log(tween.id, sibling);
          // });
          while (siblingTweenIndex < siblingsTweens.length && (siblingsTweens[siblingTweenIndex].canRender && siblingsTweens[siblingTweenIndex].absoluteStart - tween.absoluteStart) < 0) {
            const curentSibling = siblingsTweens[siblingTweenIndex++];
            const curentSiblingAbsoluteEnd = curentSibling.absoluteEnd;
            // console.log(tween.id, curentSiblingAbsoluteEnd);
            if (curentSiblingAbsoluteEnd > parentPreviousSiblingTweenAbsoluteEnd) {
              parentPreviousSiblingTweenAbsoluteEnd = curentSiblingAbsoluteEnd;
              parentPreviousSiblingTween = curentSibling;
            }
          }
        }
      }
    });

    const previousSiblingTween = prevTween || parentPreviousSiblingTween;

    if (previousSiblingTween) {
      if (previousSiblingTween.absoluteEnd >= tween.absoluteStart) {
        // const endDelayOverShoot = previousSiblingTween.endDelay - (previousSiblingTween.absoluteEnd - tween.absoluteStart);
        previousSiblingTween.endDelay -= (previousSiblingTween.absoluteEnd - tween.absoluteStart);
        if (previousSiblingTween.endDelay < 0) {
          previousSiblingTween.changeDuration += previousSiblingTween.endDelay;
          if (previousSiblingTween.changeDuration < 0) {
            previousSiblingTween.changeDuration = minValue;
          }
          previousSiblingTween.endDelay = 0;
        }

        previousSiblingTween.end = previousSiblingTween.start + previousSiblingTween.delay + previousSiblingTween.changeDuration + previousSiblingTween.endDelay;
        previousSiblingTween.absoluteEnd = previousSiblingTween.timelineOffset + previousSiblingTween.end;
        previousSiblingTween._changeEndTime = previousSiblingTween.end - previousSiblingTween.endDelay;
        previousSiblingTween.absoluteChangeEnd = previousSiblingTween.timelineOffset + previousSiblingTween._changeEndTime;
        let next = previousSiblingTween.next;
        // console.log(tween.id, previousSiblingTween.id);
        while (next) {
          let cachedNext = next;
          next.changeDuration = minValue;
          next = next.next;
          if (cachedNext) {
            cachedNext.canRender = 0;
            if (cachedNext.previous) {
              cachedNext.previous.next = cachedNext.next;
            }
            if (cachedNext.next) {
              cachedNext.next.previous = cachedNext.previous;
            }
          }
        }
      }
      previousSiblingTween.next = tween;
      tween.previous = previousSiblingTween;
    }

    prevTween = tween;
    tweens.push(tween);
  }

  return tweens;
}

export function getTweenProgress(fromNumber, toNumber, progressValue, roundValue) {
  let value = fromNumber + (progressValue * (toNumber - fromNumber));
  return !roundValue ? value : round(value, roundValue);
}
