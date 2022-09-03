/*
  * anime.js v3.3.0 - ES5 IIFE
  * (c) 2022 Julian Garnier
  * Released under the MIT license
  * animejs.com
*/

var anime = (function () {
  'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // Misc
  var noop = function noop() {};
  var pi = Math.PI;
  var minValue = Number.MIN_VALUE; // Strings

  var emptyString = '';
  var openParenthesisString = '(';
  var closeParenthesisString = ')';
  var closeParenthesisWithSpaceString = ') ';
  var commaString = ',';
  var rgbaString = 'rgba(';
  var hexValuePrefix = '0x'; // Default animation parameters

  var defaultAnimationSettings = {
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
    timelineOffset: 0
  };
  var defaultTweenSettings = {
    duration: 1000,
    delay: 0,
    endDelay: 0,
    easing: 'easeOutElastic(1, .5)',
    round: 0
  }; // Global settings

  var settings = {
    speed: 1,
    suspendWhenDocumentHidden: true
  }; // Animation type

  var animationTypes = {
    OBJECT: 0,
    ATTRIBUTE: 1,
    CSS: 2,
    TRANSFORM: 3
  };
  var valueTypes = {
    NUMBER: 0,
    UNIT: 1,
    COLOR: 2,
    PATH: 3,
    COMPLEX: 4
  }; // Transforms

  var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective', 'matrix', 'matrix3d'];
  var transformsFragmentStrings = validTransforms.reduce(function (a, v) {
    return _objectSpread2(_objectSpread2({}, a), {}, _defineProperty({}, v, v + openParenthesisString));
  }, {}); // Regex

  var hexTestRgx = /(^#([\da-f]{3}){1,2}$)|(^#([\da-f]{4}){1,2}$)/i;
  var rgbTestRgx = /^rgb/i;
  var hslTestRgx = /^hsl/i;
  var rgbExecRgx = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i;
  var rgbaExecRgx = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  var hslExecRgx = /hsl\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*\)/i;
  var hslaExecRgx = /hsla\(\s*(-?\d+|-?\d*.\d+)\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)%\s*,\s*(-?\d+|-?\d*.\d+)\s*\)/i;
  var springTestRgx = /^spring/;
  var easingsExecRgx = /\(([^)]+)\)/;
  var digitWithExponentRgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  var unitsExecRgx = /^([+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)+(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)$/;
  var lowerCaseRgx = /([a-z])([A-Z])/g;
  var lowerCaseRgxParam = '$1-$2';
  var transformsExecRgx = /(\w+)\(([^)]*)\)/g;
  var relativeValuesExecRgx = /^(\*=|\+=|-=)/;

  function selectString(str) {
    try {
      var nodes = document.querySelectorAll(str);
      return nodes;
    } catch (e) {
      return;
    }
  } // Numbers functions

  function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
  }
  function round(val) {
    var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    return Math.round(val * base) / base;
  }
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } // Types

  var is = {
    arr: function arr(a) {
      return Array.isArray(a);
    },
    obj: function obj(a) {
      return a.constructor === Object;
    },
    svg: function svg(a) {
      return a instanceof SVGElement;
    },
    dom: function dom(a) {
      return a.nodeType || is.svg(a);
    },
    num: function num(a) {
      return typeof a === 'number';
    },
    str: function str(a) {
      return typeof a === 'string';
    },
    fnc: function fnc(a) {
      return typeof a === 'function';
    },
    und: function und(a) {
      return typeof a === 'undefined';
    },
    nil: function nil(a) {
      return is.und(a) || a === null;
    },
    hex: function hex(a) {
      return hexTestRgx.test(a);
    },
    rgb: function rgb(a) {
      return rgbTestRgx.test(a);
    },
    hsl: function hsl(a) {
      return hslTestRgx.test(a);
    },
    col: function col(a) {
      return is.hex(a) || is.rgb(a) || is.hsl(a);
    },
    key: function key(a) {
      return !defaultAnimationSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes';
    }
  }; // Arrays

  function toArray(o) {
    if (is.arr(o)) return o;
    if (is.str(o)) o = selectString(o) || o;
    if (o instanceof NodeList || o instanceof HTMLCollection) return [].slice.call(o);
    return [o];
  }
  function arrayContains(arr, val) {
    return arr.some(function (a) {
      return a === val;
    });
  } // Objects

  function replaceObjectProps(o1, o2) {
    var o = _objectSpread2({}, o1);

    for (var p in o1) {
      o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p];
    }

    return o;
  }
  function mergeObjects(o1, o2) {
    var o = _objectSpread2({}, o1);

    for (var p in o2) {
      o[p] = is.und(o1[p]) ? o2[p] : o1[p];
    }

    return o;
  } // Functions

  function applyArguments(func, args) {
    return func.apply(null, args);
  } // Document

  var isBrowser = !is.und(window) && !is.und(window.document);
  function isDocumentHidden() {
    return isBrowser && document.hidden;
  }

  // Cache
  var cache = {
    DOM: new Map(),
    CSS: {},
    propertyNames: {},
    springs: {}
  };

  function parseEasingParameters(string) {
    var match = easingsExecRgx.exec(string);
    return match ? match[1].split(',').map(function (p) {
      return parseFloat(p);
    }) : [];
  } // Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js


  function spring(string, duration) {
    var params = parseEasingParameters(string);
    var mass = clamp(is.und(params[0]) ? 1 : params[0], .1, 100);
    var stiffness = clamp(is.und(params[1]) ? 100 : params[1], .1, 100);
    var damping = clamp(is.und(params[2]) ? 10 : params[2], .1, 100);
    var velocity = clamp(is.und(params[3]) ? 0 : params[3], .1, 100);
    var w0 = Math.sqrt(stiffness / mass);
    var zeta = damping / (2 * Math.sqrt(stiffness * mass));
    var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
    var a = 1;
    var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

    function solver(t) {
      var progress = duration ? duration * t / 1000 : t;

      if (zeta < 1) {
        progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
      } else {
        progress = (a + b * progress) * Math.exp(-progress * w0);
      }

      if (t === 0 || t === 1) return t;
      return 1 - progress;
    }

    function getDuration() {
      var cached = cache.springs[string];
      if (cached) return cached;
      var frame = 1 / 6;
      var elapsed = 0;
      var rest = 0;

      while (true) {
        elapsed += frame;

        if (solver(elapsed) === 1) {
          rest++;
          if (rest >= 16) break;
        } else {
          rest = 0;
        }
      }

      var duration = elapsed * frame * 1000;
      cache.springs[string] = duration;
      return duration;
    }

    return duration ? solver : getDuration;
  } // Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function


  function steps() {
    var steps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;
    return function (t) {
      return Math.ceil(clamp(t, 0.000001, 1) * steps) * (1 / steps);
    };
  } // BezierEasing https://github.com/gre/bezier-easing


  var bezier = function () {
    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    function A(aA1, aA2) {
      return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }

    function B(aA1, aA2) {
      return 3.0 * aA2 - 6.0 * aA1;
    }

    function C(aA1) {
      return 3.0 * aA1;
    }

    function calcBezier(aT, aA1, aA2) {
      return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }

    function getSlope(aT, aA1, aA2) {
      return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
      var currentX,
          currentT,
          i = 0;

      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;

        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > 0.0000001 && ++i < 10);

      return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
      for (var i = 0; i < 4; ++i) {
        var currentSlope = getSlope(aGuessT, mX1, mX2);
        if (currentSlope === 0.0) return aGuessT;
        var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
        aGuessT -= currentX / currentSlope;
      }

      return aGuessT;
    }

    function bezier(mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) return;
      var sampleValues = new Float32Array(kSplineTableSize);

      if (mX1 !== mY1 || mX2 !== mY2) {
        for (var i = 0; i < kSplineTableSize; ++i) {
          sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
        }
      }

      function getTForX(aX) {
        var intervalStart = 0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }

        --currentSample;
        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;
        var initialSlope = getSlope(guessForT, mX1, mX2);

        if (initialSlope >= 0.001) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }

      return function (x) {
        if (mX1 === mY1 && mX2 === mY2) return x;
        if (x === 0 || x === 1) return x;
        return calcBezier(getTForX(x), mY1, mY2);
      };
    }

    return bezier;
  }();

  var penner = function () {
    // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)
    var eases = {
      linear: function linear() {
        return function (t) {
          return t;
        };
      }
    };
    var functionEasings = {
      Sine: function Sine() {
        return function (t) {
          return 1 - Math.cos(t * Math.PI / 2);
        };
      },
      Circ: function Circ() {
        return function (t) {
          return 1 - Math.sqrt(1 - t * t);
        };
      },
      Back: function Back() {
        return function (t) {
          return t * t * (3 * t - 2);
        };
      },
      Bounce: function Bounce() {
        return function (t) {
          var pow2,
              b = 4;

          while (t < ((pow2 = Math.pow(2, --b)) - 1) / 11) {}
          return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - t, 2);
        };
      },
      Elastic: function Elastic() {
        var amplitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
        var period = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;
        var a = clamp(amplitude, 1, 10);
        var p = clamp(period, .1, 2);
        return function (t) {
          return t === 0 || t === 1 ? t : -a * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1 - p / (Math.PI * 2) * Math.asin(1 / a)) * (Math.PI * 2) / p);
        };
      }
    };
    var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];
    baseEasings.forEach(function (name, i) {
      functionEasings[name] = function () {
        return function (t) {
          return Math.pow(t, i + 2);
        };
      };
    });
    Object.keys(functionEasings).forEach(function (name) {
      var easeIn = functionEasings[name];
      eases['easeIn' + name] = easeIn;

      eases['easeOut' + name] = function (a, b) {
        return function (t) {
          return 1 - easeIn(a, b)(1 - t);
        };
      };

      eases['easeInOut' + name] = function (a, b) {
        return function (t) {
          return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 1 - easeIn(a, b)(t * -2 + 2) / 2;
        };
      };

      eases['easeOutIn' + name] = function (a, b) {
        return function (t) {
          return t < 0.5 ? (1 - easeIn(a, b)(1 - t * 2)) / 2 : (easeIn(a, b)(t * 2 - 1) + 1) / 2;
        };
      };
    });
    return eases;
  }();

  function parseEasings(easing, duration) {
    if (is.fnc(easing)) return easing;
    var name = easing.split('(')[0];
    var ease = penner[name];
    var args = parseEasingParameters(easing);

    switch (name) {
      case 'spring':
        return spring(easing, duration);

      case 'cubicBezier':
        return applyArguments(bezier, args);

      case 'steps':
        return applyArguments(steps, args);

      default:
        return applyArguments(ease, args);
    }
  }

  function getTransformUnit(propName) {
    if (propName.includes('scale')) return 0;
    if (propName.includes('rotate') || propName.includes('skew')) return 'deg';
    return 'px';
  }
  var nonConvertableUnitsYet = ['', 'deg', 'rad', 'turn'];
  function convertValueUnit(el, decomposedValue, unit) {
    nonConvertableUnitsYet[0] = unit;

    if (decomposedValue.type === valueTypes.UNIT && arrayContains(nonConvertableUnitsYet, decomposedValue.unit)) {
      return decomposedValue;
    }

    var valueNumber = decomposedValue.number;
    var valueUnit = decomposedValue.unit;
    var cached = cache.CSS[valueNumber + valueUnit + unit];

    if (!is.und(cached)) {
      decomposedValue.number = cached;
    } else {
      var baseline = 100;
      var tempEl = document.createElement(el.tagName);
      var parentNode = el.parentNode;
      var parentEl = parentNode && parentNode !== document ? parentNode : document.body;
      parentEl.appendChild(tempEl);
      tempEl.style.position = 'absolute';
      tempEl.style.width = baseline + valueUnit;
      var currentUnitWidth = tempEl.offsetWidth ? tempEl.offsetWidth / 100 : 0;
      tempEl.style.width = baseline + unit;
      var newUnitWidth = tempEl.offsetWidth ? tempEl.offsetWidth / 100 : 0;
      var factor = tempEl.offsetWidth ? currentUnitWidth / newUnitWidth : 0;
      parentEl.removeChild(tempEl);
      var convertedValue = factor * valueNumber;
      decomposedValue.number = convertedValue;
      cache.CSS[valueNumber + valueUnit + unit] = convertedValue;
    }

    decomposedValue.type === valueTypes.UNIT;
    decomposedValue.unit = unit;
    return decomposedValue;
  }

  function getTransformValue(target, propName, clearCache) {
    var cachedTarget = cache.DOM.get(target);

    if (clearCache) {
      for (var key in cachedTarget.transforms) {
        delete cachedTarget.transforms[key];
      }

      var str = target.style.transform;

      if (str) {
        var t;

        while (t = transformsExecRgx.exec(str)) {
          cachedTarget.transforms[t[1]] = t[2];
        }
      }
    }

    var cachedValue = cachedTarget.transforms[propName];
    return !is.und(cachedValue) ? cachedValue : (propName.includes(validTransforms[7]) ? 1 : 0) + getTransformUnit(propName);
  }

  function sanitizePropertyName(propertyName, targetEl, animationType) {
    if (animationType === animationTypes.CSS || // Handle special cases where properties like "strokeDashoffset" needs to be set as "stroke-dashoffset"
    // but properties like "baseFrequency" should stay in lowerCamelCase
    animationType === animationTypes.ATTRIBUTE && is.svg(targetEl) && propertyName in targetEl.style) {
      var cachedPropertyName = cache.propertyNames[propertyName];

      if (cachedPropertyName) {
        return cachedPropertyName;
      } else {
        var lowerCaseName = propertyName.replace(lowerCaseRgx, lowerCaseRgxParam).toLowerCase();
        cache.propertyNames[propertyName] = lowerCaseName;
        return lowerCaseName;
      }
    } else {
      return propertyName;
    }
  }

  // adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCircleLength(el) {
    return pi * 2 * el.getAttribute('r');
  }

  function getRectLength(el) {
    return el.getAttribute('width') * 2 + el.getAttribute('height') * 2;
  }

  function getLineLength(el) {
    return getDistance({
      x: el.getAttribute('x1'),
      y: el.getAttribute('y1')
    }, {
      x: el.getAttribute('x2'),
      y: el.getAttribute('y2')
    });
  }

  function getPolylineLength(el) {
    var points = el.points;
    if (is.und(points)) return;
    var totalLength = 0;
    var previousPos;

    for (var i = 0; i < points.numberOfItems; i++) {
      var currentPos = points.getItem(i);
      if (i > 0) totalLength += getDistance(previousPos, currentPos);
      previousPos = currentPos;
    }

    return totalLength;
  }

  function getPolygonLength(el) {
    var points = el.points;
    if (is.und(points)) return;
    return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
  }

  function getTotalLength(el) {
    if (el.getTotalLength) return el.getTotalLength();
    var tagName = el.tagName.toLowerCase();
    var totalLength;

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
    var pathLength = getTotalLength(el);
    el.setAttribute('stroke-dasharray', pathLength);
    return pathLength;
  }

  function getParentSvgEl(el) {
    var parentEl = el.parentNode;

    while (is.svg(parentEl)) {
      var parentNode = parentEl.parentNode;
      if (!is.svg(parentNode)) break;
      parentEl = parentNode;
    }

    return parentEl;
  } // SVG Responsive utils


  function getPathParentSvg(pathEl, svgData) {
    var svg = svgData || {};
    var parentSvgEl = svg.el || getParentSvgEl(pathEl);
    var rect = parentSvgEl.getBoundingClientRect();
    var viewBoxAttr = parentSvgEl.getAttribute('viewBox');
    var width = rect.width;
    var height = rect.height;
    var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
    return {
      el: parentSvgEl,
      viewBox: viewBox,
      x: viewBox[0] / 1,
      y: viewBox[1] / 1,
      w: width,
      h: height,
      vW: viewBox[2],
      vH: viewBox[3]
    };
  } // Path animation


  function getPath(path, percent) {
    var pathEl = is.str(path) ? selectString(path)[0] : path;
    var p = percent || 100;
    return function (property) {
      return {
        isPath: true,
        isTargetInsideSVG: false,
        property: property,
        el: pathEl,
        svg: getPathParentSvg(pathEl),
        totalLength: +getTotalLength(pathEl) * (p / 100)
      };
    };
  }

  function getPathPoint(pathEl, progress) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var length = progress + offset >= 1 ? progress + offset : 0;
    return pathEl.getPointAtLength(length);
  }

  function getPathProgress(pathObject, progress, roundValue) {
    var pathEl = pathObject.el;
    var pathProperty = pathObject.property;
    var isPathTargetInsideSVG = pathObject.isTargetInsideSVG;
    var parentSvg = getPathParentSvg(pathEl, pathObject.svg);
    var p = getPathPoint(pathEl, progress, 0);
    var p0 = getPathPoint(pathEl, progress, -1);
    var p1 = getPathPoint(pathEl, progress, +1);
    var scaleX = isPathTargetInsideSVG ? 1 : parentSvg.w / parentSvg.vW;
    var scaleY = isPathTargetInsideSVG ? 1 : parentSvg.h / parentSvg.vH;
    var value;

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
        var elParentNode = el.parentNode;
        return elParentNode && elParentNode.tagName === 'filter'; // Only consider scale as a valid SVG attribute on filter element
      }

      return true;
    }
  }

  function convertPropertyValueToTweens(propertyName, propertyValue, tweenSettings) {
    var value = propertyValue;

    var settings = _objectSpread2({}, tweenSettings);

    settings.property = propertyName; // Override duration if easing is a spring

    if (springTestRgx.test(settings.easing)) {
      settings.duration = spring(settings.easing);
    }

    if (is.arr(value)) {
      var l = value.length;
      var isFromTo = l === 2 && !is.obj(value[0]);

      if (!isFromTo) {
        // In case of a keyframes array, duration is divided by the number of tweens
        if (!is.fnc(tweenSettings.duration)) {
          settings.duration = tweenSettings.duration / l;
        }
      } else {
        // Transform [from, to] values shorthand to a valid tween value
        value = {
          value: value
        };
      }
    }

    var valuesArray = is.arr(value) ? value : [value];
    return valuesArray.map(function (v, i) {
      var obj = is.obj(v) && !v.isPath ? v : {
        value: v
      }; // Default delay value should only be applied to the first tween

      if (is.und(obj.delay)) {
        obj.delay = !i ? tweenSettings.delay : 0;
      } // Default endDelay value should only be applied to the last tween


      if (is.und(obj.endDelay)) {
        obj.endDelay = i === valuesArray.length - 1 ? tweenSettings.endDelay : 0;
      }

      return obj;
    }).map(function (k) {
      return mergeObjects(k, settings);
    });
  }

  function flattenParamsKeyframes(keyframes) {
    var properties = {};
    var propertyNames = keyframes.map(function (key) {
      return Object.keys(key);
    }).filter(is.key).reduce(function (a, b) {
      if (a.indexOf(b) < 0) {
        a.push(b);
      }
      return a;
    }, []);

    var _loop = function _loop(i, l) {
      var propName = propertyNames[i];
      properties[propName] = keyframes.map(function (key) {
        var newKey = {};

        for (var p in key) {
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
    };

    for (var i = 0, l = propertyNames.length; i < l; i++) {
      _loop(i);
    }

    return properties;
  }

  function getKeyframesFromProperties(tweenSettings, params) {
    var keyframes = [];
    var paramsKeyframes = params.keyframes;

    if (paramsKeyframes) {
      params = mergeObjects(flattenParamsKeyframes(paramsKeyframes), params);
    }

    for (var p in params) {
      if (is.key(p)) {
        keyframes.push(convertPropertyValueToTweens(p, params[p], tweenSettings));
      }
    }

    return keyframes;
  }

  var tweenId = 0;
  function convertKeyframesToTweens(keyframes, target, propertyName, animationType, index, total, targetPropertyTweens, animationOffsetTime) {
    var prevTween;
    var tweens = [];

    var _loop = function _loop(i, l) {
      var tween = {};

      for (var key in keyframes[i]) {
        var prop = getFunctionValue(keyframes[i][key], target, index, total);

        if (is.arr(prop)) {
          prop = prop.map(function (v) {
            return getFunctionValue(v, target, index, total);
          });

          if (prop.length === 1) {
            prop = prop[0];
          }
        }

        tween[key] = prop;
      }

      var tweenValue = tween.value;
      var originalValue = decomposeValue(getOriginalAnimatableValue(target, propertyName, animationType));
      var from = void 0,
          to = void 0; // Decompose values

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
          to = _objectSpread2({}, prevTween.to);
        }

        if (prevTween) {
          from = _objectSpread2({}, prevTween.to);
        } else {
          from = _objectSpread2({}, originalValue);

          if (is.und(to)) {
            to = _objectSpread2({}, originalValue);
          }
        }
      } // Apply operators


      if (from.operator) {
        from.number = getRelativeValue(!prevTween ? originalValue.number : prevTween.to.number, from.number, from.operator);
      }

      if (to.operator) {
        to.number = getRelativeValue(from.number, to.number, to.operator);
      } // Values omogenisation in cases of type difference between "from" and "to"


      if (from.type !== to.type) {
        if (from.type === valueTypes.COMPLEX || to.type === valueTypes.COMPLEX) {
          var complexValue = from.type === valueTypes.COMPLEX ? from : to;
          var notComplexValue = from.type === valueTypes.COMPLEX ? to : from;
          notComplexValue.type = valueTypes.COMPLEX;
          notComplexValue.strings = complexValue.strings;
          notComplexValue.numbers = [notComplexValue.number];
        } else if (from.type === valueTypes.UNIT && to.type === valueTypes.PATH) {
          to.unit = from.unit;
        } else if (from.type === valueTypes.UNIT || to.type === valueTypes.UNIT) {
          var unitValue = from.type === valueTypes.UNIT ? from : to;
          var notUnitValue = from.type === valueTypes.UNIT ? to : from;
          notUnitValue.type = valueTypes.UNIT;
          notUnitValue.unit = unitValue.unit;
        } else if (from.type === valueTypes.COLOR || to.type === valueTypes.COLOR) {
          var colorValue = from.type === valueTypes.COLOR ? from : to;
          var notColorValue = from.type === valueTypes.COLOR ? to : from;
          notColorValue.type = valueTypes.COLOR;
          notColorValue.strings = colorValue.strings;
          notColorValue.numbers = [0, 0, 0, 0];
        }
      } // Unit conversion


      if (from.unit !== to.unit) {
        var valueToConvert = to.unit ? from : to;
        var unitToConvertTo = to.unit ? to.unit : from.unit;
        convertValueUnit(target, valueToConvert, unitToConvertTo);
      } // Default to 0 for non existing complex values


      if (to.numbers && from.numbers && to.numbers.length !== from.numbers.length) {
        to.numbers.forEach(function (number, i) {
          return from.numbers[i] = 0;
        });
        to.strings.forEach(function (string, i) {
          return from.strings[i] = string;
        });
      } // Check if target is a children of an SVG element for path animation


      if (to.type === valueTypes.PATH) {
        var cached = cache.DOM.get(target);
        if (cached) to.path.isTargetInsideSVG = cached.isSVG;
      } // Reference the cached transforms here to avoid unnecessary call to .get() during render


      if (animationType === animationTypes.TRANSFORM) {
        tween.cachedTransforms = cache.DOM.get(target).transforms;
      }

      tween.id = tweenId++;
      tween.type = animationType;
      tween.property = propertyName;
      tween.target = target;
      tween.from = from;
      tween.to = to;
      tween.animationOffsetTime = animationOffsetTime;
      tween.duration = parseFloat(tween.duration) || minValue;
      tween.changeDuration = tween.duration;
      tween.delay = parseFloat(tween.delay);
      tween.start = prevTween ? prevTween.end : 0;
      tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
      tween.absoluteStart = animationOffsetTime + tween.start;
      tween.absoluteEnd = animationOffsetTime + tween.end;
      tween.easing = parseEasings(tween.easing, tween.duration);
      prevTween = tween;
      tweens.push(tween);
      var tweenIndex = 0;

      while (tweenIndex < targetPropertyTweens.length && targetPropertyTweens[tweenIndex].absoluteStart - tween.absoluteStart < 0) {
        tweenIndex++;
      }

      targetPropertyTweens.splice(tweenIndex, 0, tween);
      var previousTargetTween = targetPropertyTweens[tweenIndex - 1];

      if (previousTargetTween) {
        if (previousTargetTween.absoluteEnd >= tween.absoluteStart) {
          previousTargetTween.endDelay -= previousTargetTween.absoluteEnd - tween.absoluteStart;

          if (previousTargetTween.endDelay < 0) {
            previousTargetTween.changeDuration += previousTargetTween.endDelay;
            previousTargetTween.endDelay = 0;
          }

          previousTargetTween.end = previousTargetTween.start + previousTargetTween.delay + previousTargetTween.changeDuration + previousTargetTween.endDelay;
          previousTargetTween.absoluteEnd = previousTargetTween.animationOffsetTime + previousTargetTween.end;
        }

        previousTargetTween.next = tween;
        tween.previous = previousTargetTween;
      }
    };

    for (var i = 0, l = keyframes.length; i < l; i++) {
      _loop(i);
    }

    return tweens;
  }
  function getTweenProgress(fromNumber, toNumber, progressValue, roundValue) {
    var value = fromNumber + progressValue * (toNumber - fromNumber);
    return !roundValue ? value : round(value, roundValue);
  }

  var animationsId = 0;
  var rootTargets = new Map();
  function getAdjustedAnimationTime(animation, time) {
    return animation.isReversed ? animation.duration - time : time;
  }
  function resetAnimationTime(animation) {
    animation._startTime = 0;
    animation._lastCurrentTime = getAdjustedAnimationTime(animation, animation.currentTime) * (1 / settings.speed);
    return animation;
  }
  function toggleAnimationDirection(animation) {
    var direction = animation.direction;

    if (direction !== 'alternate') {
      animation.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }

    animation.isReversed = !animation.isReversed;
    animation.children.forEach(function (child) {
      return child.isReversed = animation.isReversed;
    });
    return animation;
  }
  function syncAnimationChildren(animation, time, muteCallbacks, manual) {
    if (!manual || manual && !(time < animation.currentTime)) {
      for (var i = 0; i < animation._childrenLength; i++) {
        var child = animation.children[i];
        child.seek(time - child.timelineOffset, muteCallbacks);
      }
    } else {
      for (var j = animation._childrenLength; j--;) {
        var _child = animation.children[j];

        _child.seek(time - _child.timelineOffset, muteCallbacks);
      }
    }
  }
  function renderAnimationTweens(animation, time) {
    var i = 0;
    var tweens = animation.tweens;
    var absTime = animation.timelineOffset + time;

    while (i < animation.tweensLength) {
      var tween = tweens[i++];
      if (tween.previous && absTime < tween.previous.absoluteEnd || tween.next && absTime > tween.next.absoluteStart) continue;
      var tweenProgress = tween.easing(clamp(time - tween.start - tween.delay, 0, tween.changeDuration) / tween.duration);
      var tweenProperty = tween.property;
      var tweenRound = tween.round;
      var tweenFrom = tween.from;
      var tweenTo = tween.to;
      var tweenType = tween.type;
      var tweenValueType = tweenTo.type;
      var tweenTarget = tween.target;
      var value = void 0;

      if (tweenValueType == valueTypes.NUMBER) {
        value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound);
      } else if (tweenValueType == valueTypes.UNIT) {
        value = getTweenProgress(tweenFrom.number, tweenTo.number, tweenProgress, tweenRound) + tweenTo.unit;
      } else if (tweenValueType == valueTypes.COLOR) {
        var fn = tweenFrom.numbers;
        var tn = tweenTo.numbers;
        value = rgbaString;
        value += getTweenProgress(fn[0], tn[0], tweenProgress, 1) + commaString;
        value += getTweenProgress(fn[1], tn[1], tweenProgress, 1) + commaString;
        value += getTweenProgress(fn[2], tn[2], tweenProgress, 1) + commaString;
        value += getTweenProgress(fn[3], tn[3], tweenProgress) + closeParenthesisString;
      } else if (tweenValueType == valueTypes.PATH) {
        value = getPathProgress(tweenTo.path, tweenProgress * tweenTo.number, tweenRound) + tweenTo.unit;
      } else if (tweenValueType == valueTypes.COMPLEX) {
        value = tweenTo.strings[0];

        for (var j = 0, l = tweenTo.numbers.length; j < l; j++) {
          var number = getTweenProgress(tweenFrom.numbers[j], tweenTo.numbers[j], tweenProgress, tweenRound);
          var nextString = tweenTo.strings[j + 1];

          if (!nextString) {
            value += number;
          } else {
            value += number + nextString;
          }
        }
      } // console.log(value);


      if (tweenType == animationTypes.OBJECT) {
        tweenTarget[tweenProperty] = value;
      } else if (tweenType == animationTypes.TRANSFORM) {
        tween.cachedTransforms[tweenProperty] = value;

        if (tween.renderTransforms) {
          var str = emptyString;

          for (var key in tween.cachedTransforms) {
            str += transformsFragmentStrings[key] + tween.cachedTransforms[key] + closeParenthesisWithSpaceString;
          }

          tweenTarget.style.transform = str;
        }
      } else if (tweenType == animationTypes.CSS) {
        tweenTarget.style[tweenProperty] = value;
      } else if (tweenType == animationTypes.ATTRIBUTE) {
        tweenTarget.setAttribute(tweenProperty, value);
      }
    }
  }
  function setAnimationProgress(animation, parentTime, manual) {
    var animationDuration = animation.duration;
    var animationChangeStartTime = animation._changeStartTime;
    var animationChangeEndTime = animationDuration - animation._changeEndTime;
    var animationTime = getAdjustedAnimationTime(animation, parentTime);
    var canRender = animationTime <= animationChangeStartTime && animation.currentTime !== 0 || animationTime >= animationChangeEndTime && animation.currentTime !== animationDuration;
    animation.progress = clamp(animationTime / animationDuration, 0, 1);

    if (animation._childrenLength) {
      syncAnimationChildren(animation, animationTime, 0, manual);
    }

    if (!animation.began && animation.currentTime > 0) {
      animation.began = 1;
      animation.begin(animation);
    }

    if (!animation.loopBegan && animation.currentTime > 0) {
      animation.loopBegan = 1;
      animation.loopBegin(animation);
    }

    if (animationTime > animationChangeStartTime && animationTime < animationChangeEndTime) {
      if (!animation.changeBegan) {
        animation.changeBegan = 1;
        animation.changeCompleted = 0;
        animation.changeBegin(animation);
      }

      animation.change(animation);
      canRender = 1;
    } else {
      if (animation.changeBegan) {
        animation.changeCompleted = 1;
        animation.changeBegan = 0;
        animation.changeComplete(animation);
      }
    }

    animation.currentTime = clamp(animationTime, 0, animationDuration);
    if (canRender) renderAnimationTweens(animation, animation.currentTime);
    if (animation.began) animation.update(animation);

    if (parentTime >= animationDuration) {
      animation._lastCurrentTime = 0;

      if (animation.remainingIterations && animation.remainingIterations !== true) {
        animation.remainingIterations--;
      }

      if (!animation.remainingIterations) {
        animation.paused = 1;

        if (!animation.completed) {
          animation.completed = 1;
          animation.loopComplete(animation);
          animation.complete(animation);

          animation._resolve(animation);
        }
      } else {
        animation._startTime = animation._parentCurrentTime;
        animation.loopComplete(animation);
        animation.loopBegan = 0;

        if (animation.direction === 'alternate') {
          toggleAnimationDirection(animation);
        }
      }
    }
  }
  function resetAnimation(animation) {
    animation.currentTime = 0;
    animation.progress = 0;
    animation.paused = 1;
    animation.began = 0;
    animation.loopBegan = 0;
    animation.changeBegan = 0;
    animation.completed = 0;
    animation.changeCompleted = 0;
    animation.remainingIterations = animation.loop;
    animation.finished = window.Promise && new Promise(function (resolve) {
      return animation._resolve = resolve;
    });
    animation.isReversed = animation.direction === 'reverse';

    for (var i = animation._childrenLength; i--;) {
      resetAnimation(animation.children[i]);
    }

    if (animation.isReversed && animation.loop !== true || animation.direction === 'alternate' && animation.loop === 1) animation.remainingIterations++;
    renderAnimationTweens(animation, animation.isReversed ? animation.duration : 0);
    return animation;
  }
  function createAnimation(params, parentAnimation) {
    var parentTargets = parentAnimation ? parentAnimation.targets : rootTargets;
    var animationSettings = replaceObjectProps(defaultAnimationSettings, params);
    var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
    var propertyKeyframes = getKeyframesFromProperties(tweenSettings, params);
    var targets = registerTargetsToMap(params.targets, parentTargets);
    var targetsLength = targets.size;
    var tweens = [];

    if (!parentAnimation) {
      animationSettings.timelineOffset = Date.now();
    }

    var maxDuration = 0;
    var changeStartTime;
    var changeEndTime = 0;
    var i = 0;
    targets.forEach(function (targetTweens, target) {
      var lastTransformGroupIndex;
      var lastTransformGroupLength;

      for (var j = 0, keysLength = propertyKeyframes.length; j < keysLength; j++) {
        var keyframes = propertyKeyframes[j];
        var keyframesPropertyName = keyframes[0].property;
        var type = getAnimationType(target, keyframesPropertyName);
        var property = sanitizePropertyName(keyframesPropertyName, target, type);
        var targetPropertyTweens = targetTweens[property];

        if (!targetPropertyTweens) {
          targetPropertyTweens = targetTweens[property] = [];
        }

        if (is.num(type)) {
          var animationPropertyTweens = convertKeyframesToTweens(keyframes, target, property, type, i, targetsLength, targetPropertyTweens, animationSettings.timelineOffset);
          var animationPropertyTweensLength = animationPropertyTweens.length;
          var firstTween = animationPropertyTweens[0];
          var lastTween = animationPropertyTweens[animationPropertyTweensLength - 1];
          var lastTweenChangeEndTime = lastTween.end - lastTween.endDelay;
          if (is.und(changeStartTime) || firstTween.delay < changeStartTime) changeStartTime = firstTween.delay;
          if (lastTween.end > maxDuration) maxDuration = lastTween.end;
          if (lastTweenChangeEndTime > changeEndTime) changeEndTime = lastTweenChangeEndTime;

          if (type == animationTypes.TRANSFORM) {
            lastTransformGroupIndex = tweens.length;
            lastTransformGroupLength = lastTransformGroupIndex + animationPropertyTweensLength;
          }

          tweens.push.apply(tweens, _toConsumableArray(animationPropertyTweens));
        }
      }

      if (!is.und(lastTransformGroupIndex)) {
        for (var t = lastTransformGroupIndex; t < lastTransformGroupLength; t++) {
          tweens[t].renderTransforms = true;
        }
      }

      i++;
    });
    var animation = mergeObjects(animationSettings, {
      id: animationsId++,
      targets: targets,
      tweens: tweens,
      tweensLength: tweens.length,
      children: [],
      duration: targetsLength ? maxDuration : tweenSettings.duration,
      // Total duration of the animation
      progress: 0,
      // [0 to 1] range, represent the % of completion of an animation total duration
      currentTime: 0,
      // The curent time relative to the animation [0 to animation duration]
      _parentCurrentTime: 0,
      // Root animation current time for simple animations or timeline current time for timeline children
      _startTime: 0,
      // Store at what parentCurrentTime the animation started to calculate the relative currentTime
      _lastCurrentTime: 0,
      // Store the animation current time when the animation playback is paused to adjust the new time when played again
      _changeStartTime: targetsLength ? changeStartTime : tweenSettings.delay,
      _changeEndTime: targetsLength ? maxDuration - changeEndTime : tweenSettings.endDelay,
      _childrenLength: 0
    });
    return resetAnimation(animation);
  }

  var engine = {
    activeProcesses: [],
    elapsedTime: 0
  };
  var raf = requestAnimationFrame;
  var engineRaf = 0;

  function tickEngine(t) {
    engine.elapsedTime = t;
    var activeProcessesLength = engine.activeProcesses.length;
    var i = 0;

    while (i < activeProcessesLength) {
      var activeInstance = engine.activeProcesses[i];

      if (!activeInstance.paused) {
        activeInstance.tick(t);
        i++;
      } else {
        engine.activeProcesses.splice(i, 1);
        activeProcessesLength--;
      }
    }

    engineRaf = activeProcessesLength ? raf(tickEngine) : 0;
  }

  function startEngine(engine) {
    if (!engineRaf && (!isDocumentHidden() || !settings.suspendWhenDocumentHidden) && engine.activeProcesses.length > 0) {
      engineRaf = raf(tickEngine);
    }
  }

  function handleVisibilityChange() {

    if (isDocumentHidden()) {
      // suspend ticks
      engineRaf = cancelAnimationFrame(engineRaf);
    } else {
      // is back to active tab
      // first adjust animations to consider the time that ticks were suspended
      engine.activeProcesses.forEach(resetAnimationTime);
      startEngine(engine);
    }
  }

  if (isBrowser) {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  function registerDomTarget(target) {
    if (!is.dom(target)) return target;
    var cachedTarget = cache.DOM.get(target);

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
    var _ref;

    return new Set(!targets ? [] : (_ref = []).concat.apply(_ref, _toConsumableArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))));
  }
  function getAnimatables(targets) {
    var parsedTargetsSet = parseTargets(targets);
    parsedTargetsSet.forEach(registerDomTarget);
    return parsedTargetsSet;
  }
  function registerTargetsToMap(targets, parentMap) {
    var parsedTargetsSet = parseTargets(targets);
    var targetsMap = new Map();
    parsedTargetsSet.forEach(function (target) {
      registerDomTarget(target);
      var cachedTargetProperties = parentMap.get(target);

      if (!cachedTargetProperties) {
        cachedTargetProperties = {};
        parentMap.set(target, cachedTargetProperties);
      }

      targetsMap.set(target, cachedTargetProperties);
    });
    return targetsMap;
  } // Remove targets from animation

  function removeTweensWithTargets(targetsSet, tweensArray) {
    for (var i = tweensArray.length; i--;) {
      if (targetsSet.has(tweensArray[i].target)) {
        tweensArray.splice(i, 1);
      }
    }
  }

  function removeTweensWithTargetsFromAnimation(targetsSet, animation) {
    var tweens = animation.tweens;
    var children = animation.children;

    for (var i = children.length; i--;) {
      var child = children[i];
      var childTweens = child.tweens;
      removeTweensWithTargets(targetsSet, childTweens);
      if (!childTweens.length && !child.children.length) children.splice(i, 1);
    } // Return early to prevent animations created without targets (and without tweens) to be paused


    if (!tweens.length) return;
    removeTweensWithTargets(targetsSet, tweens);
    if (!tweens.length && !children.length) animation.pause();
  }

  function removeAnimatablesFromAnimation(targets, animation) {
    var targetsSet = parseTargets(targets);
    removeTweensWithTargetsFromAnimation(targetsSet, animation);
  }
  function removeAnimatablesFromActiveAnimations(targets) {
    var targetsSet = parseTargets(targets);

    for (var i = engine.activeProcesses.length; i--;) {
      var animation = engine.activeProcesses[i];
      removeTweensWithTargetsFromAnimation(targetsSet, animation);
    }
  }

  function rgbToRgba(rgbValue) {
    var rgba = rgbExecRgx.exec(rgbValue) || rgbaExecRgx.exec(rgbValue);
    var r = +rgba[1];
    var g = +rgba[2];
    var b = +rgba[3];
    var a = +(rgba[4] || 1);
    return [r, g, b, a];
  } // HEX3 / HEX3A / HEX6 / HEX6A Color value string -> RGBA values array


  function hexToRgba(hexValue) {
    var hexLength = hexValue.length;
    var isShort = hexLength === 4 || hexLength === 5;
    var isAlpha = hexLength === 5 || hexLength === 9;
    var r = +(hexValuePrefix + hexValue[1] + hexValue[isShort ? 1 : 2]);
    var g = +(hexValuePrefix + hexValue[isShort ? 2 : 3] + hexValue[isShort ? 2 : 4]);
    var b = +(hexValuePrefix + hexValue[isShort ? 3 : 5] + hexValue[isShort ? 3 : 6]);
    var a = isAlpha ? +((hexValuePrefix + hexValue[isShort ? 4 : 7] + hexValue[isShort ? 4 : 8]) / 255).toFixed(3) : 1;
    return [r, g, b, a];
  } // HSL / HSLA Color value string -> RGBA values array


  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function hslToRgba(hslValue) {
    var hsla = hslExecRgx.exec(hslValue) || hslaExecRgx.exec(hslValue);
    var h = hsla[1] / 360;
    var s = hsla[2] / 100;
    var l = hsla[3] / 100;
    var a = +(hsla[4] || 1);
    var r, g, b;

    if (s == 0) {
      r = g = b = l;
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = round(hue2rgb(p, q, h + 1 / 3) * 255, 1);
      g = round(hue2rgb(p, q, h) * 255, 1);
      b = round(hue2rgb(p, q, h - 1 / 3) * 255, 1);
    }

    return [r, g, b, a];
  } // All in one color converter to convert color strings to RGBA array values


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
    var cachedDOMElement = cache.DOM.get(target);

    if (!cachedDOMElement) {
      return animationTypes.OBJECT;
    } else {
      if (!is.nil(target.getAttribute(prop)) || cachedDOMElement.isSVG && isValidSVGAttribute(target, prop)) return animationTypes.ATTRIBUTE; // Handle DOM and SVG attributes

      if (arrayContains(validTransforms, prop)) return animationTypes.TRANSFORM; // Handle CSS Transform properties differently than CSS to allow individual animations

      if (prop in target.style) return animationTypes.CSS; // All other CSS properties

      if (!is.und(target[prop])) return animationTypes.OBJECT; // Handle DOM element properies that can't be accessed using getAttribute()

      return console.warn("Can't find property '".concat(prop, "' on target '").concat(target, "'."));
    }
  }
  function getOriginalAnimatableValue(target, propName, animationType) {
    var animType = is.num(animationType) ? animationType : getAnimationType(target, propName); // if (animType === animationTypes.CSS) console.log(target);

    switch (animType) {
      case animationTypes.OBJECT:
        return target[propName] || 0;
      // Fallaback to 0 if the property doesn't exist on the object.

      case animationTypes.ATTRIBUTE:
        return target.getAttribute(propName);

      case animationTypes.TRANSFORM:
        return getTransformValue(target, propName, true);

      case animationTypes.CSS:
        var cssValue = target.style[propName] || getComputedStyle(target).getPropertyValue(propName);
        if (cssValue === 'auto') cssValue = 0;
        return cssValue;
    }
  }
  function getRelativeValue(x, y, operator) {
    switch (operator) {
      case '+':
        return x + y;

      case '-':
        return x - y;

      case '*':
        return x * y;
    }
  }
  function decomposeValue(rawValue) {
    var val = rawValue;
    var value = {
      type: valueTypes.NUMBER
    };
    var numberedVal = +val;

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
      var operatorMatch = relativeValuesExecRgx.exec(val);

      if (operatorMatch) {
        val = val.slice(2);
        value.operator = operatorMatch[0][0];
      }

      var unitMatch = unitsExecRgx.exec(val);

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
        var stringifiedVal = val + emptyString;
        var matchedNumbers = stringifiedVal.match(digitWithExponentRgx);
        value.type = valueTypes.COMPLEX;
        value.numbers = matchedNumbers ? matchedNumbers.map(Number) : [];
        value.strings = stringifiedVal.split(digitWithExponentRgx) || [];
        return value;
      }
    }
  }
  function getTargetValue(targetSelector, propName, unit) {
    var _getAnimatables = getAnimatables(targetSelector),
        _getAnimatables2 = _slicedToArray(_getAnimatables, 1),
        target = _getAnimatables2[0];

    if (target) {
      var value = getOriginalAnimatableValue(target, propName);

      if (unit) {
        var decomposedValue = decomposeValue(value);

        if (decomposedValue.type === valueTypes.NUMBER || decomposedValue.type === valueTypes.UNIT) {
          var convertedValue = convertValueUnit(target, decomposedValue, unit);
          value = convertedValue.number + convertedValue.unit;
        }
      }

      return value;
    }
  }

  function seek(animation, time, muteCallbacks) {
    if (muteCallbacks) {
      if (animation.children) {
        syncAnimationChildren(animation, time, 1);
      }

      renderAnimationTweens(animation, time);
    } else {
      setAnimationProgress(animation, getAdjustedAnimationTime(animation, time), 1);
    }

    return animation;
  }
  function pause(animation) {
    animation.paused = 1;
    return resetAnimationTime(animation);
  }
  function play(animation) {
    if (!animation.paused) return animation;
    if (animation.completed) resetAnimation(animation);
    animation.paused = 0;
    engine.activeProcesses.push(animation);
    resetAnimationTime(animation);
    startEngine(engine);
    return animation;
  }
  function reverse(animation) {
    toggleAnimationDirection(animation);
    animation.completed = animation.isReversed ? 0 : 1;
    return resetAnimationTime(animation);
  }
  function restart(animation) {
    resetAnimation(animation);
    return play(animation);
  }

  function animate() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var parent = arguments.length > 1 ? arguments[1] : undefined;
    var animation = createAnimation(params, parent);

    animation.reset = function () {
      return resetAnimation(animation);
    };

    animation.seek = function (time, muteCallbacks) {
      return seek(animation, time, muteCallbacks);
    };

    animation.pause = function () {
      return pause(animation);
    };

    animation.play = function () {
      return play(animation);
    };

    animation.reverse = function () {
      return reverse(animation);
    };

    animation.restart = function () {
      return restart(animation);
    };

    animation.remove = function (targets) {
      return removeAnimatablesFromAnimation(targets, animation);
    };

    animation.tick = function (t) {
      animation._parentCurrentTime = t;
      if (!animation._startTime) animation._startTime = animation._parentCurrentTime;
      setAnimationProgress(animation, (animation._parentCurrentTime + (animation._lastCurrentTime - animation._startTime)) * settings.speed);
    };

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
    var animationsLength = animationsOrInstances.length;

    if (!animationsLength) {
      return {
        duration: tweenSettings.duration,
        changeStartTime: tweenSettings.delay,
        changeEndTime: tweenSettings.endDelay
      };
    } else {
      var timings = {};

      for (var i = 0; i < animationsLength; i++) {
        var anim = animationsOrInstances[i];
        var timelineOffset = anim.timelineOffset ? anim.timelineOffset : 0;
        var changeStartTime = timelineOffset + anim._changeStartTime;

        if (is.und(timings.changeStartTime) || changeStartTime < timings.changeStartTime) {
          timings.changeStartTime = changeStartTime;
        }

        var duration = timelineOffset + anim.duration;

        if (is.und(timings.duration) || duration > timings.duration) {
          timings.duration = duration;
        }

        var changeEndTime = timelineOffset + anim.duration - anim._changeEndTime;

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
    var operatorMatch = relativeValuesExecRgx.exec(timelineOffset);

    if (operatorMatch) {
      var parsedOffset = +timelineOffset.slice(2);
      var operator = operatorMatch[0][0];
      return getRelativeValue(timelineDuration, parsedOffset, operator);
    }
  }

  function createTimeline() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var tl = animate(params);
    tl.duration = 0;

    tl.add = function (instanceParams, timelineOffset) {
      var tlIndex = engine.activeProcesses.indexOf(tl); // TODO: investigate

      var children = tl.children;
      if (tlIndex > -1) engine.activeProcesses.splice(tlIndex, 1); // TODO: investigate

      var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
      insParams.targets = insParams.targets || params.targets;
      var tlDuration = tl.duration;
      insParams.autoplay = false;
      insParams.direction = tl.direction;
      insParams.timelineOffset = parseTimelineOffset(timelineOffset, tlDuration);
      tl.seek(insParams.timelineOffset, true);
      var ins = animate(insParams, tl);
      ins.duration + insParams.timelineOffset;
      children.push(ins);
      tl._childrenLength = tl.children.length;
      var timings = getTimingsFromAnimationsOrInstances(children, params);
      tl._changeStartTime = timings.changeStartTime;
      tl._changeEndTime = timings.changeEndTime;
      tl.duration = timings.duration;
      tl.seek(0, true);
      tl.reset();
      if (tl.autoplay) tl.play();
      return tl;
    };

    return tl;
  }

  function stagger(val) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var direction = params.direction || 'normal';
    var easing = params.easing ? parseEasings(params.easing) : null;
    var grid = params.grid;
    var axis = params.axis;
    var fromIndex = params.from || 0;
    var fromFirst = fromIndex === 'first';
    var fromCenter = fromIndex === 'center';
    var fromLast = fromIndex === 'last';
    var isRange = is.arr(val);
    var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
    var val2 = isRange ? parseFloat(val[1]) : 0;
    var unitMatch = unitsExecRgx.exec(isRange ? val[1] : val);
    var unit = unitMatch ? unitMatch[2] : 0;
    var start = params.start || 0 + (isRange ? val1 : 0);
    var values = [];
    var maxValue = 0;
    return function (el, i, t) {
      if (fromFirst) fromIndex = 0;
      if (fromCenter) fromIndex = (t - 1) / 2;
      if (fromLast) fromIndex = t - 1;

      if (!values.length) {
        for (var index = 0; index < t; index++) {
          if (!grid) {
            values.push(Math.abs(fromIndex - index));
          } else {
            var fromX = !fromCenter ? fromIndex % grid[0] : (grid[0] - 1) / 2;
            var fromY = !fromCenter ? Math.floor(fromIndex / grid[0]) : (grid[1] - 1) / 2;
            var toX = index % grid[0];
            var toY = Math.floor(index / grid[0]);
            var distanceX = fromX - toX;
            var distanceY = fromY - toY;
            var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            if (axis === 'x') value = -distanceX;
            if (axis === 'y') value = -distanceY;
            values.push(value);
          }

          maxValue = Math.max.apply(Math, _toConsumableArray(values));
        }

        if (easing) values = values.map(function (val) {
          return easing(val / maxValue) * maxValue;
        });
        if (direction === 'reverse') values = values.map(function (val) {
          return axis ? val < 0 ? val * -1 : -val : Math.abs(maxValue - val);
        });
      }

      var spacing = isRange ? (val2 - val1) / maxValue : val1;
      return start + spacing * (Math.round(values[i] * 100) / 100) + unit;
    };
  }

  var anime = animate;
  anime.version = '3.3.0';
  anime.speed = 1;
  anime.suspendWhenDocumentHidden = true;
  anime.running = engine.activeProcesses;
  anime.remove = removeAnimatablesFromActiveAnimations;
  anime.get = getTargetValue;

  anime.set = function (targets) {
    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    props.targets = targets;
    props.duration = 0;
    return animate(props);
  };

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

})();
