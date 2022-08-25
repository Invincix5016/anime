/*
  * anime.js v3.3.0 - ES6 UMD
  * (c) 2022 Julian Garnier
  * Released under the MIT license
  * animejs.com
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.anime = factory());
})(this, (function () { 'use strict';

  // Misc

  const noop = () => {};
  const pi = Math.PI;
  const minValue = Number.MIN_VALUE;

  // Strings

  const emptyString = '';
  const openParenthesisString = '(';
  const closeParenthesisString = ')';
  const closeParenthesisWithSpaceString = ') ';
  const commaString = ',';
  const rgbaString = 'rgba(';
  const hexValuePrefix = '0x';

  // Default animation parameters

  const defaultAnimationSettings = {
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
  };

  const defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0,
  };

  // Global settings

  const settings = {
    speed: 1,
    suspendWhenDocumentHidden: true,
  };

  // Animation type

  const animationTypes = {
    OBJECT: 0,
    ATTRIBUTE: 1,
    CSS: 2,
    TRANSFORM: 3,
  };

  const valueTypes = {
    NUMBER: 0,
    UNIT: 1,
    COLOR: 2,
    PATH: 3,
    COMPLEX: 4,
  };

  // Transforms

  const validTransforms = [
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

  const transformsFragmentStrings = validTransforms.reduce((a, v) => ({ ...a, [v]: v + openParenthesisString}), {});

  // Regex

  const hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
  const rgbTestRgx = /^rgb/i;
  const hslTestRgx = /^hsl/i;
  const rgbExecRgx = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
  const rgbaExecRgx = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  const hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
  const hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  const springTestRgx = /^spring/;
  const easingsExecRgx = /\(([^)]+)\)/;
  const digitWithExponentRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  const unitsExecRgx = /^([+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)+(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)$/;
  const lowerCaseRgx = /([a-z])([A-Z])/g;
  const lowerCaseRgxParam = '$1-$2';
  const transformsExecRgx = /(\w+)\(([^)]*)\)/g;
  const relativeValuesExecRgx = /^(\*=|\+=|-=)/;

  // Strings functions

  function selectString(str) {
    try {
      let nodes = document.querySelectorAll(str);
      return nodes;
    } catch(e) {
      return;
    }
  }

  // Numbers functions

  function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
  }

  function round(val, base = 1) {
    return Math.round(val * base) / base;
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Types

  const is = {
    arr: a => Array.isArray(a),
    obj: a => a.constructor === Object,
    svg: a => a instanceof SVGElement,
    dom: a => a.nodeType || is.svg(a),
    num: a => typeof a === 'number',
    str: a => typeof a === 'string',
    fnc: a => typeof a === 'function',
    und: a => typeof a === 'undefined',
    nil: a => is.und(a) || a === null,
    hex: a => hexTestRgx.test(a),
    rgb: a => rgbTestRgx.test(a),
    hsl: a => hslTestRgx.test(a),
    col: a => (is.hex(a) || is.rgb(a) || is.hsl(a)),
    key: a => !defaultAnimationSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes',
  };

  // Arrays

  function filterArray(arr, callback) {
    const len = arr.length;
    const thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    const result = [];
    for (let i = 0; i < len; i++) {
      if (i in arr) {
        const val = arr[i];
        if (callback.call(thisArg, val, i, arr)) {
          result.push(val);
        }
      }
    }
    return result;
  }

  function flattenArray(arr) {
    return arr.reduce((a, b) => a.concat(is.arr(b) ? flattenArray(b) : b), []);
  }

  function toArray(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  }

  function arrayContains(arr, val) {
    return arr.some(a => a === val);
  }

  // Objects

  function replaceObjectProps(o1, o2) {
    const o = {...o1};
    for (let p in o1) o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
    return o;
  }

  function mergeObjects(o1, o2) {
    const o = {...o1};
    for (let p in o2) o[p] = is.und(o1[p]) ? o2[p] : o1[p];
    return o;
  }

  // Functions

  function applyArguments(func, args) {
    return func.apply(null, args);
  }

  // Document

  const isBrowser = !is.und(window) && !is.und(window.document);

  function isDocumentHidden() {
    return isBrowser && document.hidden;
  }

  // Cache

  const cache = {
    DOM: new Map(),
    CSS: {},
    propertyNames: {},
    springs: {},
  };

  // Easings

  function parseEasingParameters(string) {
    const match = easingsExecRgx.exec(string);
    return match ? match[1].split(',').map(p => parseFloat(p)) : [];
  }

  // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

  function spring(string, duration) {
    const params = parseEasingParameters(string);
    const mass = clamp(is.und(params[0]) ? 1 : params[0], .1, 100);
    const stiffness = clamp(is.und(params[1]) ? 100 : params[1], .1, 100);
    const damping = clamp(is.und(params[2]) ? 10 : params[2], .1, 100);
    const velocity =  clamp(is.und(params[3]) ? 0 : params[3], .1, 100);

    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    const wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    const a = 1;
    const b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      let progress = duration ? (duration * t) / 1000 : t;
      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }
      if (t === 0 || t === 1) return t;
      return 1 - progress;
    }

    function getDuration() {
      const cached = cache.springs[string];
      if (cached) return cached;
      const frame = 1/6;
      let elapsed = 0;
      let rest = 0;
      while(true) {
        elapsed += frame;
        if (solver(elapsed) === 1) {
          rest++;
          if (rest >= 16) break;
        } else {
          rest = 0;
        }
      }
      const duration = elapsed * frame * 1000;
      cache.springs[string] = duration;
      return duration;
    }

    return duration ? solver : getDuration;
  }

  // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

  function steps(steps = 10) {
    return t => Math.ceil((clamp(t, 0.000001, 1)) * steps) * (1 / steps);
  }

  // BezierEasing https://github.com/gre/bezier-easing

  const bezier = (() => {
    const kSplineTableSize = 11;
    const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }  function C(aA1)      { return 3.0 * aA1 }
    function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }
    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      let currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (let i = 0; i < 4; ++i) {
        const currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        const currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }
      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
      let sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (let i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {
        let intervalStart = 0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;

        const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }

      return x => {
        if (mX1 === mY1 && mX2 === mY2) return x;
        if (x === 0 || x === 1) return x;
        return calcBezier(getTForX(x), mY1, mY2);
      }
    }

    return bezier;
  })();

  const penner = (() => {
    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
    const eases = { linear: () => t => t };

    const functionEasings = {
      Sine: () => t => 1 - Math.cos(t * Math.PI / 2),
      Circ: () => t => 1 - Math.sqrt(1 - t * t),
      Back: () => t => t * t * (3 * t - 2),
      Bounce: () => t => {
        let pow2, b = 4;
        while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
      },
      Elastic: (amplitude = 1, period = .5) => {
        const a = clamp(amplitude, 1, 10);
        const p = clamp(period, .1, 2);
        return t => {
          return (t === 0 || t === 1) ? t : 
            -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
        }
      }
    };

    const baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

    baseEasings.forEach((name, i) => {
      functionEasings[name] = () => t => Math.pow(t, i + 2);
    });

    Object.keys(functionEasings).forEach(name => {
      const easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;
      eases['easeOut' + name] = (a, b) => t => 1 - easeIn(a, b)(1 - t);
      eases['easeInOut' + name] = (a, b) => t => t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
      eases['easeOutIn' + name] = (a, b) => t => t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
    });

    return eases;
  })();

  function parseEasings(easing, duration) {
    if (is.fnc(easing)) return easing;
    const name = easing.split('(')[0];
    const ease = penner[name];
    const args = parseEasingParameters(easing);
    switch (name) {
      case 'spring' : return spring(easing, duration);
      case 'cubicBezier' : return applyArguments(bezier, args);
      case 'steps' : return applyArguments(steps, args);
      default : return applyArguments(ease, args);
    }
  }

  function getTransformUnit(propName) {
    if (propName.includes('scale')) return 0;
    if (propName.includes('rotate') || propName.includes('skew')) return 'deg';
    return 'px';
  }

  const nonConvertableUnitsYet = ['', 'deg', 'rad', 'turn'];

  function convertValueUnit(el, decomposedValue, unit) {
    nonConvertableUnitsYet[0] = unit;
    if (decomposedValue.type === valueTypes.UNIT && arrayContains(nonConvertableUnitsYet, decomposedValue.unit)) {
      return decomposedValue;
    }
    const valueNumber = decomposedValue.number;
    const valueUnit = decomposedValue.unit;
    const cached = cache.CSS[valueNumber + valueUnit + unit];
    if (!is.und(cached)) {
      decomposedValue.number = cached;
    } else {
      const baseline = 100;
      const tempEl = document.createElement(el.tagName);
      const parentNode = el.parentNode;
      const parentEl = (parentNode && (parentNode !== document)) ? parentNode : document.body;
      parentEl.appendChild(tempEl);
      tempEl.style.position = 'absolute';
      tempEl.style.width = baseline + valueUnit;
      const currentUnitWidth = tempEl.offsetWidth ? (tempEl.offsetWidth / 100) : 0;
      tempEl.style.width = baseline + unit;
      const newUnitWidth = tempEl.offsetWidth ? (tempEl.offsetWidth / 100) : 0;
      const factor = tempEl.offsetWidth ? (currentUnitWidth / newUnitWidth) : 0;
      parentEl.removeChild(tempEl);
      const convertedValue = factor * valueNumber;
      decomposedValue.number = convertedValue;
      cache.CSS[valueNumber + valueUnit + unit] = convertedValue;
    }
    decomposedValue.type === valueTypes.UNIT;
    decomposedValue.unit = unit;
    return decomposedValue;
  }

  function getTransformValue(target, propName, clearCache) {
    const cachedTarget = cache.DOM.get(target);
    if (clearCache) {
      for (let key in cachedTarget.transforms) {
        delete cachedTarget.transforms[key];
      }
      const str = target.style.transform;
      if (str) {
        let t;
        while (t = transformsExecRgx.exec(str)) {
          cachedTarget.transforms[t[1]] = t[2];
        }
      }
    }
    const cachedValue = cachedTarget.transforms[propName];
    return !is.und(cachedValue) ? cachedValue : (propName.includes(validTransforms[7]) ? 1 : 0) + getTransformUnit(propName);
  }

  const activeAnimations = [];

  let raf;

  function tick(t) {
    // memo on algorithm issue:
    // dangerous iteration over mutable `activeAnimations`
    // (that collection may be updated from within callbacks of `tick`-ed animation instances)
    let activeAnimationsLength = activeAnimations.length;
    let i = 0;
    while (i < activeAnimationsLength) {
      const activeAnimation = activeAnimations[i];
      if (!activeAnimation.paused) {
        activeAnimation.tick(activeAnimation, t);
        i++;
      } else {
        activeAnimations.splice(i, 1);
        activeAnimationsLength--;
      }
    }
    raf = i > 0 ? requestAnimationFrame(tick) : undefined;
  }

  function startEngine() {
    if (!raf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && activeAnimations.length > 0) {
      raf = requestAnimationFrame(tick);
    }
  }


  function handleVisibilityChange() {

    if (isDocumentHidden()) {
      // suspend ticks
      raf = cancelAnimationFrame(raf);
    } else {
      // is back to active tab
      // first adjust animations to consider the time that ticks were suspended
      activeAnimations.forEach(
        instance => instance ._onDocumentVisibility()
      );
      startEngine();
    }
  }

  if (isBrowser) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  function registerTarget(target) {
    if (!is.dom(target)) return target;
    let cachedTarget = cache.DOM.get(target);
    if (!cachedTarget) {
      cachedTarget = {
        transforms: {},
        isSVG: is.svg(target)
      };
      cache.DOM.set(target, cachedTarget);
    }
    return target;
  }

  function parseTargets(targets) {
    const targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
    return filterArray(targetsArray, (item, pos, self) => self.indexOf(item) === pos);
  }

  function getAnimatables(targets) {
    const parsed = parseTargets(targets);
    parsed.length;
    return parsed.map(registerTarget);
  }

  // Remove targets from animation

  function removeTweensWithTargets(targetsArray, tweensArray) {
    for (let i = tweensArray.length; i--;) {
      if (arrayContains(targetsArray, tweensArray[i].target)) {
        tweensArray.splice(i, 1);
      }
    }
  }

  function removeTweensWithTargetsFromAnimation(targetsArray, animation) {
    const tweens = animation.tweens;
    const children = animation.children;
    for (let i = children.length; i--;) {
      const child = children[i];
      const childTweens = child.tweens;
      removeTweensWithTargets(targetsArray, childTweens);
      if (!childTweens.length && !child.children.length) children.splice(i, 1);
    }
    // Return early to prevent animations created without targets (and without tweens) to be paused
    if (!tweens.length) return;
    removeTweensWithTargets(targetsArray, tweens);
    if (!tweens.length && !children.length) animation.pause();
  }

  function removeAnimatablesFromAnimation(targets, animation) {
    const targetsArray = parseTargets(targets);
    removeTweensWithTargetsFromAnimation(targetsArray, animation);
  }

  function removeAnimatablesFromActiveAnimations(targets) {
    const targetsArray = parseTargets(targets);
    for (let i = activeAnimations.length; i--;) {
      const animation = activeAnimations[i];
      removeTweensWithTargetsFromAnimation(targetsArray, animation);
    }
  }

  // getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
  // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCircleLength(el) {
    return pi * 2 * el.getAttribute('r');
  }

  function getRectLength(el) {
    return (el.getAttribute('width') * 2) + (el.getAttribute('height') * 2);
  }

  function getLineLength(el) {
    return getDistance(
      {x: el.getAttribute('x1'), y: el.getAttribute('y1')}, 
      {x: el.getAttribute('x2'), y: el.getAttribute('y2')}
    );
  }

  function getPolylineLength(el) {
    const points = el.points;
    if (is.und(points)) return;
    let totalLength = 0;
    let previousPos;
    for (let i = 0 ; i < points.numberOfItems; i++) {
      const currentPos = points.getItem(i);
      if (i > 0) totalLength += getDistance(previousPos, currentPos);
      previousPos = currentPos;
    }
    return totalLength;
  }

  function getPolygonLength(el) {
    const points = el.points;
    if (is.und(points)) return;
    return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
  }

  function getTotalLength(el) {
    if (el.getTotalLength) return el.getTotalLength();
    const tagName = el.tagName.toLowerCase();
    let totalLength;
    if (tagName == 'circle') {
      totalLength = getCircleLength(el);
    } else if (tagName == 'rect') {
      totalLength = getRectLength(el);
    } else if (tagName == 'line') {
      totalLength = getLineLength(el);
    } else if (tagName == 'polyline') {
      totalLength = getPolylineLength(el);
    } else if (tagName == 'polygon') {
      totalLength = getPolygonLength(el);
    }
    return totalLength;
  }

  function setDashoffset(el) {
    const pathLength = getTotalLength(el);
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

  function getParentSvgEl(el) {
    let parentEl = el.parentNode;
    while (is.svg(parentEl)) {
      const parentNode = parentEl.parentNode;
      if (!is.svg(parentNode)) break;
      parentEl = parentNode;
    }
    return parentEl;
  }

  // SVG Responsive utils

  function getPathParentSvg(pathEl, svgData) {
    const svg = svgData || {};
    const parentSvgEl = svg.el || getParentSvgEl(pathEl);
    const rect = parentSvgEl.getBoundingClientRect();
    const viewBoxAttr = parentSvgEl.getAttribute('viewBox');
    const width = rect.width;
    const height = rect.height;
    const viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
    return {
      el: parentSvgEl,
      viewBox: viewBox,
      x: viewBox[0] / 1,
      y: viewBox[1] / 1,
      w: width,
      h: height,
      vW: viewBox[2],
      vH: viewBox[3]
    }
  }

  // Path animation

  function getPath(path, percent) {
    const pathEl = is.str(path) ? selectString(path)[0] : path;
    const p = percent || 100;
    return function(property) {
      return {
        isPath: true,
        isTargetInsideSVG: false,
        property,
        el: pathEl,
        svg: getPathParentSvg(pathEl),
        totalLength: +(getTotalLength(pathEl)) * (p / 100)
      }
    }
  }

  function getPathPoint(pathEl, progress, offset = 0) {
    const length = progress + offset >= 1 ? progress + offset : 0;
    return pathEl.getPointAtLength(length);
  }

  function getPathProgress(pathObject, progress, roundValue) {
    const pathEl = pathObject.el;
    const pathProperty = pathObject.property;
    const isPathTargetInsideSVG = pathObject.isTargetInsideSVG;
    const parentSvg = getPathParentSvg(pathEl, pathObject.svg);
    const p = getPathPoint(pathEl, progress, 0);
    const p0 = getPathPoint(pathEl, progress, -1);
    const p1 = getPathPoint(pathEl, progress, +1);
    const scaleX = isPathTargetInsideSVG ? 1 : parentSvg.w / parentSvg.vW;
    const scaleY = isPathTargetInsideSVG ? 1 : parentSvg.h / parentSvg.vH;
    let value;
    if (pathProperty == 'x') {
      value = (p.x - parentSvg.x) * scaleX;
    } else if (pathProperty == 'y') {
      value = (p.y - parentSvg.y) * scaleY;
    } else if (pathProperty == 'angle') {
      value = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / pi;
    }
    return !roundValue ? value : round(value, roundValue);
  }

  function isValidSVGAttribute(el, propertyName) {
    if (propertyName === 'opacity') return; // Return false and to use CSS opacity animation instead (already better default values (opacity: 1 instead of 0))
    if (propertyName in el.style || propertyName in el) {
      if (propertyName === 'scale') {
        const elParentNode = el.parentNode;
        return elParentNode && elParentNode.tagName === 'filter'; // Only consider scale as a valid SVG attribute on filter element
      }
      return true;
    }
  }

  // RGB / RGBA Color value string -> RGBA values array

  function rgbToRgba(rgbValue) {
    const rgba = rgbExecRgx.exec(rgbValue) || rgbaExecRgx.exec(rgbValue);
    const r = +rgba[1];
    const g = +rgba[2];
    const b = +rgba[3];
    const a = +(rgba[4] || 1);
    return [r, g, b, a];
  }

  // HEX3 / HEX3A / HEX6 / HEX6A Color value string -> RGBA values array

  function hexToRgba(hexValue) {
    const hexLength = hexValue.length;
    const isShort = hexLength === 4 || hexLength === 5;
    const isAlpha = hexLength === 5 || hexLength === 9;
    const r = +(hexValuePrefix + hexValue[1] + hexValue[isShort ? 1 : 2]);
    const g = +(hexValuePrefix + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]);
    const b = +(hexValuePrefix + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]);
    const a = isAlpha ? +((hexValuePrefix + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1;
    return [r, g, b, a];
  }

  // HSL / HSLA Color value string -> RGBA values array

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToRgba(hslValue) {
    const hsla = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
    const h = hsla[1] / 360;
    const s = hsla[2] / 100;
    const l = hsla[3] / 100;
    const a = +(hsla[4] || 1);
    let r, g, b;
    if (s == 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = round(hue2rgb(p, q, h + 1 / 3) * 255, 1);
      g = round(hue2rgb(p, q, h) * 255, 1);
      b = round(hue2rgb(p, q, h - 1 / 3) * 255, 1);
    }
    return [r, g, b, a];
  }

  // All in one color converter to convert color strings to RGBA array values

  function convertColorStringValuesToRgbaArray(colorValue) {
    if (is.rgb(colorValue)) return rgbToRgba(colorValue);
    if (is.hex(colorValue)) return hexToRgba(colorValue);
    if (is.hsl(colorValue)) return hslToRgba(colorValue);
  }

  function getFunctionValue(functionValue, target, index, total) {
    if (!is.fnc(functionValue)) return functionValue;
    return functionValue(target, index, total) || 0; // Fallback to 0 if the function results in undefined / NaN / null
  }

  function getAnimationType(target, prop) {
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
  }

  function getOriginalAnimatableValue(target, propName, animationType) {
    const animType = is.num(animationType) ? animationType : getAnimationType(target, propName);
    switch (animType) {
      case animationTypes.OBJECT: return target[propName] || 0; // Fallaback to 0 if the property doesn't exist on the object.
      case animationTypes.ATTRIBUTE: return target.getAttribute(propName);
      case animationTypes.TRANSFORM: return getTransformValue(target, propName, true);
      case animationTypes.CSS: return target.style[propName] || getComputedStyle(target).getPropertyValue(propName);
    }
  }

  function getRelativeValue(x, y, operator) {
    switch (operator) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
    }
  }

  function decomposeValue(rawValue) {
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
        value.numbers = matchedNumbers ? matchedNumbers.map(Number) : [0];
        value.strings = stringifiedVal.split(digitWithExponentRgx) || [];
        return value;
      }
    }
  }

  function getTargetValue(targetSelector, propName, unit) {
    const targets = getAnimatables(targetSelector);
    if (targets) {
      const target = targets[0];
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

  function sanitizePropertyName(propertyName, targetEl, animationType) {
    if (
      animationType === animationTypes.CSS || 
      // Handle special cases where properties like "strokeDashoffset" needs to be set as "stroke-dashoffset"
      // but properties like "baseFrequency" should stay in lowerCamelCase
      (animationType === animationTypes.ATTRIBUTE && (is.svg(targetEl) && propertyName in targetEl.style))
    ) {
      const cachedPropertyName = cache.propertyNames[propertyName];
      if (cachedPropertyName) {
        return cachedPropertyName;
      } else {
        const lowerCaseName = propertyName.replace(lowerCaseRgx, lowerCaseRgxParam).toLowerCase();
        cache.propertyNames[propertyName] = lowerCaseName;
        return lowerCaseName;
      }
    } else {
      return propertyName;
    }
  }

  function convertPropertyValueToTweens(propertyName, propertyValue, tweenSettings) {
    let value = propertyValue;
    const settings = {...tweenSettings};
    settings.property = propertyName;
    // Override duration if easing is a spring
    if (springTestRgx.test(settings.easing)) {
      settings.duration = spring(settings.easing);
    }
    if (is.arr(value)) {
      const l = value.length;
      const isFromTo = (l === 2 && !is.obj(value[0]));
      if (!isFromTo) {
        // In case of a keyframes array, duration is divided by the number of tweens
        if (!is.fnc(tweenSettings.duration)) {
          settings.duration = tweenSettings.duration / l;
        }
      } else {
        // Transform [from, to] values shorthand to a valid tween value
        value = { value: value };
      }
    }
    const valuesArray = is.arr(value) ? value : [value];
    return valuesArray.map((v, i) => {
      const obj = (is.obj(v) && !v.isPath) ? v : { value: v };
      // Default delay value should only be applied to the first tween
      if (is.und(obj.delay)) {
        obj.delay = !i ? tweenSettings.delay : 0;
      }
      // Default endDelay value should only be applied to the last tween
      if (is.und(obj.endDelay)) {
        obj.endDelay = i === valuesArray.length - 1 ? tweenSettings.endDelay : 0;
      }
      return obj;
    }).map(k => mergeObjects(k, settings));
  }


  function flattenParamsKeyframes(keyframes) {
    const properties = {};
    const propertyNames = filterArray(flattenArray(keyframes.map(key => Object.keys(key))), p => is.key(p))
    .reduce((a,b) => {
      if (a.indexOf(b) < 0) {
        a.push(b);
      }
      return a;
    }, []);
    for (let i = 0; i < propertyNames.length; i++) {
      const propName = propertyNames[i];
      properties[propName] = keyframes.map(key => {
        const newKey = {};
        for (let p in key) {
          if (is.key(p)) {
            if (p == propName) {
              newKey.value = key[p];
            }
          } else {
            newKey[p] = key[p];
          }
        }
        return newKey;
      });
    }
    return properties;
  }

  function getKeyframesFromProperties(tweenSettings, params) {
    const keyframes = [];
    const paramsKeyframes = params.keyframes;
    if (paramsKeyframes) {
      params = mergeObjects(flattenParamsKeyframes(paramsKeyframes), params);  }
    for (let p in params) {
      if (is.key(p)) {
        keyframes.push(convertPropertyValueToTweens(p, params[p], tweenSettings));
      }
    }
    return keyframes;
  }

  // Tweens

  let tweenId = 0;

  function convertKeyframesToTweens(keyframes, target, propertyName, animationType, index, total, groupId) {
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

  function getTweenProgress(fromNumber, toNumber, progressValue, roundValue) {
    let value = fromNumber + (progressValue * (toNumber - fromNumber));
    return !roundValue ? value : round(value, roundValue);
  }

  let animationsId = 0;
  let tweensGroupsId = 0;

  function createAnimation(params) {
    const instanceSettings = replaceObjectProps(defaultAnimationSettings, params);
    const tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    const propertyKeyframes = getKeyframesFromProperties(tweenSettings, params);
    const targets = getAnimatables(params.targets);
    const targetsLength = targets.length;
    const tweens = [];

    let maxDuration = 0;
    let changeStartTime;
    let changeEndTime = 0;

    for (let i = 0; i < targetsLength; i++) {
      const target = targets[i];
      if (target) {
        let lastTransformGroupIndex;
        let lastTransformGroupLength;
        for (let j = 0, keysLength = propertyKeyframes.length; j < keysLength; j++) {
          const keyframes = propertyKeyframes[j];
          const keyframesPropertyName = keyframes[0].property;
          const type = getAnimationType(target, keyframesPropertyName);
          const property = sanitizePropertyName(keyframesPropertyName, target, type);
          if (is.num(type)) {
            const tweensGroup = convertKeyframesToTweens(keyframes, target, property, type, i, targetsLength, tweensGroupsId);
            const tweensGroupLength = tweensGroup.length;
            const firstTween = tweensGroup[0];
            const lastTween = tweensGroup[tweensGroupLength - 1];
            const lastTweenChangeEndTime = lastTween.end - lastTween.endDelay;
            if (is.und(changeStartTime) || firstTween.delay < changeStartTime) changeStartTime = firstTween.delay;
            if (lastTween.end > maxDuration) maxDuration = lastTween.end;
            if (lastTweenChangeEndTime > changeEndTime) changeEndTime = lastTweenChangeEndTime;
            if (type == animationTypes.TRANSFORM) {
              lastTransformGroupIndex = tweens.length;
              lastTransformGroupLength = lastTransformGroupIndex + tweensGroupLength;
            }
            tweens.push(...tweensGroup);
            tweensGroupsId++;
          }
        }
        if (!is.und(lastTransformGroupIndex)) {
          for (let t = lastTransformGroupIndex; t < lastTransformGroupLength; t++) {
            tweens[t].renderTransforms = true;
          }
        }
      }
    }

    return mergeObjects(instanceSettings, {
      id: animationsId++,
      targets: targets,
      tweens: tweens,
      duration: targetsLength ? maxDuration : tweenSettings.duration,
      changeStartTime: targetsLength ? changeStartTime : tweenSettings.delay,
      changeEndTime: targetsLength ? maxDuration - changeEndTime : tweenSettings.endDelay,
      _now: 0,
      _startTime: 0,
      _lastTime: 0,
      children: [],
    });
  }

  function animate(params = {}) {
    // let _startTime = 0, _lastTime = 0, _now = 0;
    let children, childrenLength = 0;
    // let resolve = null;

    // function makePromise(animation) {
    //   const promise = window.Promise && new Promise(_resolve => resolve = _resolve);
    //   animation.finished = promise;
    //   return promise;
    // }

    const animation = createAnimation(params);
    // let promise = makePromise(animation);

    function toggleAnimationDirection() {
      const direction = animation.direction;
      if (direction !== 'alternate') {
        animation.direction = direction !== 'normal' ? 'normal' : 'reverse';
      }
      animation.reversed = !animation.reversed;
      children.forEach(child => child.reversed = animation.reversed);
    }

    function adjustTime(time) {
      return animation.reversed ? animation.duration - time : time;
    }

    function resetTime() {
      animation._startTime = 0;
      animation._lastTime = adjustTime(animation.currentTime) * (1 / settings.speed);
    }

    function seekChild(time, child, ignoreCallbacks) {
      if (child) {
        child.seek(time - child.timelineOffset, ignoreCallbacks);
      }
    }

    function syncAnimationChildren(time, ignoreCallbacks) {
      if (!animation.reversePlayback) {
        for (let i = 0; i < childrenLength; i++) seekChild(time, children[i], ignoreCallbacks);
      } else {
        for (let j = childrenLength; j--;) seekChild(time, children[j], ignoreCallbacks);
      }
    }

    function setTweensProgress(insTime) {
      let i = 0;
      const tweens = animation.tweens;
      const tweensLength = tweens.length;
      while (i < tweensLength) {
        // // Only check for keyframes if there is more than one tween
        // if (tweensLength) tween = filterArray(tweens, t => (insTime < t.end))[0] || tween;
        const prevTween = tweens[i - 1];
        const tween = tweens[i++];
        if (prevTween && prevTween.groupId === tween.groupId && insTime < prevTween.end) continue;
        const tweenProgress = tween.easing(clamp(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration);
        const tweenProperty = tween.property;
        const tweenRound = tween.round;
        const tweenFrom = tween.from;
        const tweenTo = tween.to;
        const tweenType = tween.type;
        const tweenValueType = tweenTo.type;
        const tweenTarget = tween.target;

        let value;

        if (tweenValueType == valueTypes.NUMBER) {
          value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound);
        } else if (tweenValueType == valueTypes.UNIT) {
          value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound) + tweenTo.unit;
        } else if (tweenValueType == valueTypes.COLOR) {
          const fn = tweenFrom.numbers;
          const tn = tweenTo.numbers;
          value = rgbaString;
          value += getTweenProgress(fn[0], tn[0], tweenProgress, 1) + commaString;
          value += getTweenProgress(fn[1], tn[1], tweenProgress, 1) + commaString;
          value += getTweenProgress(fn[2], tn[2], tweenProgress, 1) + commaString;
          value += getTweenProgress(fn[3], tn[3], tweenProgress) + closeParenthesisString;
        } else if (tweenValueType == valueTypes.PATH) {
          value = getPathProgress(tweenTo.path, tweenProgress * tweenTo.number, tweenRound) + tweenTo.unit;
        } else if (tweenValueType == valueTypes.COMPLEX) {
          value = tweenTo.strings[0];
          for (let j = 0, l = tweenTo.numbers.length; j < l; j++) {
            const number = getTweenProgress(tweenFrom.numbers[j], tweenTo.numbers[j], tweenProgress, tweenRound);
            const nextString = tweenTo.strings[j + 1];
            if (!nextString) {
              value += number;
            } else {
              value += number + nextString;
            }
          }
        }

        if (tweenType == animationTypes.OBJECT) {
          tweenTarget[tweenProperty] = value;
        } else if (tweenType == animationTypes.TRANSFORM) {
          tween.cachedTransforms[tweenProperty] = value;
          if (tween.renderTransforms) {
            let str = emptyString;
            for (let key in tween.cachedTransforms) {
              str += transformsFragmentStrings[key]+tween.cachedTransforms[key]+closeParenthesisWithSpaceString;
            }
            tweenTarget.style.transform = str;
          }
        } else if (tweenType == animationTypes.CSS) {
          tweenTarget.style[tweenProperty] = value;
        } else if (tweenType == animationTypes.ATTRIBUTE) {
          tweenTarget.setAttribute(tweenProperty, value);
        }
        tween.progress = tweenProgress;
        tween.currentValue = value;
      }
    }

    function setAnimationProgress(engineTime, ignoreCallbacks) {
      const insDuration = animation.duration;
      const insChangeStartTime = animation.changeStartTime;
      const insChangeEndTime = insDuration - animation.changeEndTime;
      const insTime = adjustTime(engineTime);
      let renderTime = insTime;
      let needsRender = ignoreCallbacks;
      animation.progress = clamp((insTime / insDuration), 0, 1);
      if (children) { syncAnimationChildren(insTime, ignoreCallbacks); }
      if (insTime <= insChangeStartTime && animation.currentTime !== 0) {
        renderTime = 0;
        needsRender = 1;
      }
      if (!insDuration || (insTime >= insChangeEndTime && animation.currentTime !== insDuration)) {
        renderTime = insDuration;
        needsRender = 1;
      }
      if (!ignoreCallbacks) {
        animation.reversePlayback = insTime < animation.currentTime;
        if (!animation.began && animation.currentTime > 0) {
          animation.began = true;
          animation.begin(animation);
        }
        if (!animation.loopBegan && animation.currentTime > 0) {
          animation.loopBegan = true;
          animation.loopBegin(animation);
        }
        if (insTime > insChangeStartTime && insTime < insChangeEndTime) {
          if (!animation.changeBegan) {
            animation.changeBegan = true;
            animation.changeCompleted = false;
            animation.changeBegin(animation);
          }
          animation.change(animation);
          needsRender = 1;
        } else {
          if (animation.changeBegan) {
            animation.changeCompleted = true;
            animation.changeBegan = false;
            animation.changeComplete(animation);
          }
        }
      }
      animation.currentTime = clamp(renderTime, 0, insDuration);
      if (needsRender) {
        setTweensProgress(animation.currentTime);
      }
      if (ignoreCallbacks) return;
      if (animation.began) animation.update(animation);
      if (engineTime >= insDuration) {
        animation._lastTime = 0;
        if (animation.remainingLoops && animation.remainingLoops !== true) {
          animation.remainingLoops--;
        }
        if (!animation.remainingLoops) {
          animation.paused = true;
          if (!animation.completed) {
            animation.completed = true;
            animation.loopComplete(animation);
            animation.complete(animation);
            // resolve();
            // promise = makePromise(animation);
          }
        } else {
          animation._startTime = animation._now;
          animation.loopComplete(animation);
          animation.loopBegan = false;
          if (animation.direction === 'alternate') {
            toggleAnimationDirection();
          }
        }
      }
    }

    animation.reset = function() {
      const direction = animation.direction;
      animation.currentTime = 0;
      animation.progress = 0;
      animation.paused = true;
      animation.began = false;
      animation.loopBegan = false;
      animation.changeBegan = false;
      animation.completed = false;
      animation.changeCompleted = false;
      animation.reversePlayback = false;
      animation.reversed = direction === 'reverse';
      animation.remainingLoops = animation.loop;
      children = animation.children;
      childrenLength = children.length;
      for (let i = childrenLength; i--;) animation.children[i].reset();
      if (animation.reversed && animation.loop !== true || (direction === 'alternate' && animation.loop === 1)) animation.remainingLoops++;
      // setTweensProgress(animation.reversed ? animation.duration : 0);
      setAnimationProgress(animation.reversed ? animation.duration : 0, true);
    };

    // internal method (for engine) to adjust animation timings before restoring engine ticks (rAF)
    animation._onDocumentVisibility = resetTime;

    animation.tick = function(animation, t) {
      animation._now = t;
      if (!animation._startTime) animation._startTime = animation._now;
      setAnimationProgress((animation._now + (animation._lastTime - animation._startTime)) * settings.speed);
    };

    animation.seek = function(time, muteCallbacks) {
      setAnimationProgress(adjustTime(time), muteCallbacks);
    };

    animation.seekSilently = function(time) {
      // // const insTime = adjustTime(time);
      // if (children) { syncAnimationChildren(time, true); }
      // setTweensProgress(time);
      setAnimationProgress(adjustTime(time), true);
    };

    animation.pause = function() {
      animation.paused = true;
      resetTime();
    };

    animation.play = function() {
      if (!animation.paused) return;
      if (animation.completed) animation.reset();
      animation.paused = false;
      activeAnimations.push(animation);
      resetTime();
      startEngine();
    };

    animation.reverse = function() {
      toggleAnimationDirection();
      animation.completed = animation.reversed ? false : true;
      resetTime();
    };

    animation.restart = function() {
      animation.reset();
      animation.play();
    };

    animation.remove = function(targets) {
      removeAnimatablesFromAnimation(targets, animation);
    };

    animation.reset();

    if (animation.autoplay) {
      if (animation.duration === minValue) {
        animation.seek(minValue);
      } else {
        animation.play();
      }
    }

    return animation;
  }

  function getTimingsFromAnimationsOrInstances(animationsOrInstances, tweenSettings) {
    const animationsLength = animationsOrInstances.length;
    if (!animationsLength) {
      return {
        duration: tweenSettings.duration,
        changeStartTime: tweenSettings.delay,
        changeEndTime: tweenSettings.endDelay,
      };
    } else {
      const timings = {};
      for (let i = 0; i < animationsLength; i++) {
        const anim = animationsOrInstances[i];
        const timelineOffset = anim.timelineOffset ? anim.timelineOffset : 0;
        const changeStartTime = timelineOffset + anim.changeStartTime;
        if (is.und(timings.changeStartTime) || changeStartTime < timings.changeStartTime) {
          timings.changeStartTime = changeStartTime;
        }
        const duration = timelineOffset + anim.duration;
        if (is.und(timings.duration) || duration > timings.duration) {
          timings.duration = duration;
        }
        const changeEndTime = timelineOffset + anim.duration - anim.changeEndTime;
        if (is.und(timings.changeEndTime) || changeEndTime > timings.changeEndTime) {
          timings.changeEndTime = changeEndTime;
        }
      }
      timings.changeEndTime = timings.duration - timings.changeEndTime;
      return timings;
    }
  }

  function parseTimelineOffset(timelineOffset, timelineDuration) {
    if (is.und(timelineOffset)) return timelineDuration;
    if (is.num(timelineOffset)) return timelineOffset;
    const operatorMatch = relativeValuesExecRgx.exec(timelineOffset);
    if (operatorMatch) {
      const parsedOffset = +timelineOffset.slice(2);
      const operator = operatorMatch[0][0];
      return getRelativeValue(timelineDuration, parsedOffset, operator);
    }
  }

  function createTimeline(params = {}) {
    let tl = animate(params);
    tl.duration = 0;
    tl.add = function(instanceParams, timelineOffset) {
      const tlIndex = activeAnimations.indexOf(tl);
      const children = tl.children;
      if (tlIndex > -1) activeAnimations.splice(tlIndex, 1);
      let insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
      insParams.targets = insParams.targets || params.targets;
      const tlDuration = tl.duration;
      insParams.autoplay = false;
      insParams.direction = tl.direction;
      insParams.timelineOffset = parseTimelineOffset(timelineOffset, tlDuration);
      tl.seek(insParams.timelineOffset, true);
      const ins = animate(insParams);
      ins.duration + insParams.timelineOffset;
      children.push(ins);
      const timings = getTimingsFromAnimationsOrInstances(children, params);
      tl.changeStartTime = timings.changeStartTime;
      tl.changeEndTime = timings.changeEndTime;
      tl.duration = timings.duration;
      tl.seek(0, true);
      tl.reset();
      if (tl.autoplay) tl.play();
      return tl;
    };
    return tl;
  }

  function stagger(val, params = {}) {
    const direction = params.direction || 'normal';
    const easing = params.easing ? parseEasings(params.easing) : null;
    const grid = params.grid;
    const axis = params.axis;
    let fromIndex = params.from || 0;
    const fromFirst = fromIndex === 'first';
    const fromCenter = fromIndex === 'center';
    const fromLast = fromIndex === 'last';
    const isRange = is.arr(val);
    const val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    const val2 = isRange ? parseFloat(val[1]) : 0;
    const unitMatch = unitsExecRgx.exec(isRange ? val[1] : val);
    const unit = unitMatch ? unitMatch[2] : 0;
    const start = params.start || 0 + (isRange ? val1 : 0);
    let values = [];
    let maxValue = 0;
    return (el, i, t) => {
      if (fromFirst) fromIndex = 0;
      if (fromCenter) fromIndex = (t - 1) / 2;
      if (fromLast) fromIndex = t - 1;
      if (!values.length) {
        for (let index = 0; index < t; index++) {
          if (!grid) {
            values.push(Math.abs(fromIndex - index));
          } else {
            const fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
            const fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
            const toX = index%grid[0];
            const toY = Math.floor(index/grid[0]);
            const distanceX = fromX - toX;
            const distanceY = fromY - toY;
            let value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === 'x') value = -distanceX;
            if (axis === 'y') value = -distanceY;
            values.push(value);
          }
          maxValue = Math.max(...values);
        }
        if (easing) values = values.map(val => easing(val / maxValue) * maxValue);
        if (direction === 'reverse') values = values.map(val => axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val));
      }
      const spacing = isRange ? (val2 - val1) / maxValue : val1;
      return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
    }
  }

  const anime = animate;

  anime.version = '3.3.0';
  anime.speed = 1;
  anime.suspendWhenDocumentHidden = true;
  anime.running = activeAnimations;
  anime.remove = removeAnimatablesFromActiveAnimations;
  anime.get = getTargetValue;
  anime.set = (targets, props = {}) => { props.targets = targets; props.duration = 0; return animate(props); };
  anime.convertPx = convertValueUnit;
  anime.path = getPath;
  anime.setDashoffset = setDashoffset;
  anime.stagger = stagger;
  anime.timeline = createTimeline;
  anime.easing = parseEasings;
  anime.penner = penner;
  anime.clamp = clamp;
  anime.random = random;

  return anime;

}));
