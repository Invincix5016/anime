import {
  valueTypes,
} from '../src/consts.js';

describe('Values', () => {

  const numberTypeTestTarget = {
    number: 1,
    decimals: 1.2,
    exponent: 1.23456e+5,
    func: 1337,
    numberString: '1',
    decimalsString: '1.2',
    exponentString: '1.23456e+5',
    funcString: '1337',
  }

  test('Number type values from numbers', () => {
    const animation = anime({
      targets: numberTypeTestTarget,
      number: 42,
      decimals: 42,
      exponent: 42,
      func: () => 42,
      numberString: 42,
      decimalsString: 42,
      exponentString: 42,
      funcString: () => 42,
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.NUMBER);
      expect(tween.to.type).toBe(valueTypes.NUMBER);
    });
  });

  test('Number type values from strings', () => {
    const animation = anime({
      targets: numberTypeTestTarget,
      number: '42',
      decimals: '42',
      exponent: '42',
      func: () => '42',
      numberString: '42',
      decimalsString: '42',
      exponentString: '42',
      funcString: () => '42',
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.NUMBER);
      expect(tween.to.type).toBe(valueTypes.NUMBER);
    });
  });

  test('Number type values from relative values operators', () => {
    const animation = anime({
      targets: numberTypeTestTarget,
      number: '+=42',
      decimals: '+=42',
      exponent: '+=42',
      func: () => '+=42',
      numberString: '+=42',
      decimalsString: '+=42',
      exponentString: '+=42',
      funcString: () => '+=42',
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.NUMBER);
      expect(tween.to.type).toBe(valueTypes.NUMBER);
      expect(tween.to.operator).toBe('+');
    });
  });

  const unitTypeTestTarget = {
    number: 1,
    decimals: 1.2,
    exponent: 1.23456e+5,
    func: 1337,
    numberUnit: '1px',
    decimalsUnit: '1.2px',
    exponentUnit: '1.23456e+5px',
    funcUnit: '1337px',
  }

  test('Unit type values', () => {
    const animation = anime({
      targets: unitTypeTestTarget,
      number: '42px',
      decimals: '42px',
      exponent: '42px',
      func: () => '42px',
      numberUnit: 42,
      decimalsUnit: 42,
      exponentUnit: 42,
      funcUnit: () => 42,
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.UNIT);
      expect(tween.from.unit).toBe('px');
      expect(tween.to.type).toBe(valueTypes.UNIT);
      expect(tween.to.number).toBe(42);
      expect(tween.to.unit).toBe('px');
    });
  });

  const colorTypeTestTarget = {
    HEX3: '#f99',
    HEX6: '#ff9999',
    RGB: 'rgb(255, 153, 153)',
    HSL: 'hsl(0, 100%, 80%)',
    HEX3A: '#f999',
    HEX6A: '#ff999999',
    RGBA: 'rgba(255, 153, 153, .6)',
    HSLA: 'hsla(0, 100%, 80%, .6)',
    HEX3: '#0FF',
    HEX6: '#00FFFF',
    RGB: 'rgb(0, 255, 255)',
    HSL: 'hsl(180, 100%, 50%)',
    HEX3A: '#0FFC',
    HEX6A: '#00FFFFCC',
    RGBA: 'rgba(0, 255, 255, .8)',
    HSLA: 'hsla(180, 100%, 50%, .8)',
    func: 'hsla(180, 100%, 50%, .8)',
  }

  test('Color type values', () => {
    const animation = anime({
      targets: colorTypeTestTarget,
      HEX3: 'hsla(180, 100%, 50%, .8)',
      HEX6: 'hsla(180, 100%, 50%, .8)',
      RGB: 'hsla(180, 100%, 50%, .8)',
      HSL: 'hsla(180, 100%, 50%, .8)',
      HEX3A: 'hsla(180, 100%, 50%, .8)',
      HEX6A: 'hsla(180, 100%, 50%, .8)',
      RGBA: 'hsla(180, 100%, 50%, .8)',
      HSLA: 'hsla(180, 100%, 50%, .8)',
      HEX3: 'hsla(180, 100%, 50%, .8)',
      HEX6: 'hsla(180, 100%, 50%, .8)',
      RGB: 'hsla(180, 100%, 50%, .8)',
      HSL: 'hsla(180, 100%, 50%, .8)',
      HEX3A: 'hsla(180, 100%, 50%, .8)',
      HEX6A: 'hsla(180, 100%, 50%, .8)',
      RGBA: 'hsla(180, 100%, 50%, .8)',
      HSLA: 'hsla(180, 100%, 50%, .8)',
      func: () => 'hsla(180, 100%, 50%, .8)',
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.COLOR);
      expect(tween.to.type).toBe(valueTypes.COLOR);
      expect(tween.to.numbers).toStrictEqual([0, 255, 255, .8]);
    });
  });

  test('Complex type values', () => {

    const complexTypeTestTarget = {
      whiteSpace: '0 1 2 1.234',
      mixedTypes: 'auto 20px auto 2rem',
      cssFilter: 'blur(100px) constrast(200)',
      func: 'blur(100px) constrast(200)',
      whiteSpaceFromNumber: 10,
      mixedTypesFromNumber: 10,
      cssFilterFromNumber: 10,
      funcFromNumber: 10,
    }

    const animation = anime({
      targets: complexTypeTestTarget,
      whiteSpace: '42 42 42 42',
      mixedTypes: 'auto 42px auto 42rem',
      cssFilter: 'blur(42px) constrast(42)',
      func: () => 'blur(42px) constrast(42)',
      whiteSpaceFromNumber: '42 42 42 42',
      mixedTypesFromNumber: 'auto 42px auto 42rem',
      cssFilterFromNumber: 'blur(42px) constrast(42)',
      funcFromNumber: () => 'blur(42px) constrast(42)',
    });

    animation.tweens.forEach( tween => {
      expect(tween.from.type).toBe(valueTypes.COMPLEX);
      expect(tween.to.type).toBe(valueTypes.COMPLEX);
      if (tween.to.numbers.length === 4) {
        expect(tween.to.numbers).toStrictEqual([42, 42, 42, 42]);
      } else {
        expect(tween.to.numbers).toStrictEqual([42, 42]);
      }
    });
  });

  test('Function based values', () => {
    const targetEls = document.querySelectorAll('.target-class');
    const animation = anime({
      targets: targetEls,
      autoplay: false,
      translateX: (el, i, total) => {
        return el.getAttribute('data-index');
      },
      duration: (el, i, total) => {
        const index = parseFloat(el.dataset.index);
        return total + ((i + index) * 100);
      },
      delay: (el, i, total) => {
        const index = parseFloat(el.dataset.index);
        return total + ((i + index) * 100);
      },
      endDelay: (el, i, total) => {
        const index = parseFloat(el.dataset.index);
        return total + ((i + index) * 100);
      }
    });

    // Property value
    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[2].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[3].from.type).toBe(valueTypes.UNIT);

    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[1].from.number).toBe(0);
    expect(animation.tweens[2].from.number).toBe(0);
    expect(animation.tweens[3].from.number).toBe(0);

    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[1].from.unit).toBe('px');
    expect(animation.tweens[2].from.unit).toBe('px');
    expect(animation.tweens[3].from.unit).toBe('px');

    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[2].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[3].to.type).toBe(valueTypes.UNIT);

    expect(animation.tweens[0].to.number).toBe(0);
    expect(animation.tweens[1].to.number).toBe(1);
    expect(animation.tweens[2].to.number).toBe(2);
    expect(animation.tweens[3].to.number).toBe(3);

    expect(animation.tweens[0].to.unit).toBe('px');
    expect(animation.tweens[1].to.unit).toBe('px');
    expect(animation.tweens[2].to.unit).toBe('px');
    expect(animation.tweens[3].to.unit).toBe('px');

    expect(targetEls[0].style.transform).toBe('translateX(0px) ');
    expect(targetEls[1].style.transform).toBe('translateX(0px) ');
    expect(targetEls[2].style.transform).toBe('translateX(0px) ');
    expect(targetEls[3].style.transform).toBe('translateX(0px) ');

    animation.seek(animation.duration);

    expect(targetEls[0].style.transform).toBe('translateX(0px) ');
    expect(targetEls[1].style.transform).toBe('translateX(1px) ');
    expect(targetEls[2].style.transform).toBe('translateX(2px) ');
    expect(targetEls[3].style.transform).toBe('translateX(3px) ');

    // Duration
    expect(animation.tweens[0].changeDuration).toBe(4);
    expect(animation.tweens[1].changeDuration).toBe(204);
    expect(animation.tweens[2].changeDuration).toBe(404);
    expect(animation.tweens[3].changeDuration).toBe(604);

    // Delay
    expect(animation.tweens[0].delay).toBe(4);
    expect(animation.tweens[1].delay).toBe(204);
    expect(animation.tweens[2].delay).toBe(404);
    expect(animation.tweens[3].delay).toBe(604);

    // EndDelay
    expect(animation.tweens[0].endDelay).toBe(4);
    expect(animation.tweens[1].endDelay).toBe(204);
    expect(animation.tweens[2].endDelay).toBe(404);
    expect(animation.tweens[3].endDelay).toBe(604);
  });

  test('Get CSS computed values', () => {
    const targetEls = document.querySelectorAll('.css-properties');
    const animation = anime({
      targets: targetEls,
      width: 100,
      fontSize: 10,
    });

    animation.seek(animation.duration);

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(150);
    expect(animation.tweens[1].from.number).toBe(20);
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[1].from.unit).toBe('px');

    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.number).toBe(100);
    expect(animation.tweens[1].to.number).toBe(10);
    expect(animation.tweens[0].to.unit).toBe('px');
    expect(animation.tweens[1].to.unit).toBe('px');

    expect(targetEls[0].style.width).toBe('100px');
    expect(targetEls[0].style.fontSize).toBe('10px');
  });

  test('Get CSS inline values', () => {
    const targetEls = document.querySelectorAll('.with-inline-styles');
    const animation = anime({
      targets: targetEls,
      width: 100,
    });

    animation.seek(animation.duration);

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(200);
    expect(animation.tweens[0].from.unit).toBe('px');

    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.number).toBe(100);
    expect(animation.tweens[0].to.unit).toBe('px');

    expect(targetEls[0].style.width).toBe('100px');
  });

  test('Get default transforms values', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 360,
      rotateX: 360,
      rotateY: 360,
      rotateZ: 360,
      skew: 45,
      skewX: 45,
      skewY: 45,
      scale: 10,
      scaleX: 10,
      scaleY: 10,
      scaleZ: 10,
      perspective: 1000,
    });

    animation.seek(animation.duration);

    // Translate
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[1].from.unit).toBe('px');
    expect(animation.tweens[2].from.unit).toBe('px');
    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[1].from.number).toBe(0);
    expect(animation.tweens[2].from.number).toBe(0);
    // Rotate
    expect(animation.tweens[3].from.unit).toBe('deg');
    expect(animation.tweens[4].from.unit).toBe('deg');
    expect(animation.tweens[5].from.unit).toBe('deg');
    expect(animation.tweens[6].from.unit).toBe('deg');
    expect(animation.tweens[3].from.number).toBe(0);
    expect(animation.tweens[4].from.number).toBe(0);
    expect(animation.tweens[5].from.number).toBe(0);
    expect(animation.tweens[6].from.number).toBe(0);
    // Skew
    expect(animation.tweens[7].from.unit).toBe('deg');
    expect(animation.tweens[8].from.unit).toBe('deg');
    expect(animation.tweens[9].from.unit).toBe('deg');
    expect(animation.tweens[7].from.number).toBe(0);
    expect(animation.tweens[8].from.number).toBe(0);
    expect(animation.tweens[9].from.number).toBe(0);
    // Scale
    expect(animation.tweens[10].from.unit).toBe(undefined);
    expect(animation.tweens[11].from.unit).toBe(undefined);
    expect(animation.tweens[12].from.unit).toBe(undefined);
    expect(animation.tweens[13].from.unit).toBe(undefined);
    expect(animation.tweens[10].from.number).toBe(1);
    expect(animation.tweens[11].from.number).toBe(1);
    expect(animation.tweens[12].from.number).toBe(1);
    expect(animation.tweens[13].from.number).toBe(1);
    // Perspective
    expect(animation.tweens[14].from.unit).toBe('px');
    expect(animation.tweens[14].from.number).toBe(0);

    const targetEl = document.querySelector('#target-id');
    expect(targetEl.style.transform).toBe('translateX(100px) translateY(100px) translateZ(100px) rotate(360deg) rotateX(360deg) rotateY(360deg) rotateZ(360deg) skew(45deg) skewX(45deg) skewY(45deg) scale(10) scaleX(10) scaleY(10) scaleZ(10) perspective(1000px) ');
  });

  test('Values with white space', () => {
    const targetEl = document.querySelector('#target-id');
    const animation = anime({
      targets: targetEl,
      backgroundSize: ['auto 100%', 'auto 200%'],
      duration: 10
    });

    expect(animation.tweens[0].from.type).toBe(valueTypes.COMPLEX);
    expect(animation.tweens[0].from.numbers[0]).toBe(100);
    expect(animation.tweens[0].from.strings[0]).toBe('auto ');
    expect(animation.tweens[0].from.strings[1]).toBe('%');

    expect(animation.tweens[0].to.type).toBe(valueTypes.COMPLEX);
    expect(animation.tweens[0].to.numbers[0]).toBe(200);
    expect(animation.tweens[0].to.strings[0]).toBe('auto ');
    expect(animation.tweens[0].to.strings[1]).toBe('%');

    expect(targetEl.style.backgroundSize).toBe('auto 100%');

    animation.seek(animation.duration);

    expect(targetEl.style.backgroundSize).toBe('auto 200%');
  });

  test('Complex CSS values', () => {
    const targetEl = document.querySelector('#target-id');
    targetEl.style.zIndex = 'auto'; // jsdom doesnt set auto to zIndex
    const animation = anime({
      targets: targetEl,
      filter: 'blur(10px) constrast(200)',
      translateX: 'calc( calc(15px * 2) -42rem)',
      zIndex: {value: 10, round: 1},
      duration: 10
    });

    expect(targetEl.style.zIndex).toBe('0');
    animation.seek(animation.duration);
    expect(targetEl.style.zIndex).toBe('10');
    expect(animation.tweens[0].to.numbers).toStrictEqual([10, 200]);
    expect(targetEl.style.filter).toBe('blur(10px) constrast(200)');
    expect(animation.tweens[1].to.numbers).toStrictEqual([15, 2, -42]);
    expect(targetEl.style.transform).toBe('translateX(calc( calc(15px * 2) -42rem)) ');
  });

  test('Relative values with operators +=, -=, *=', () => {
    const relativeEl = document.querySelector('#target-id');
    relativeEl.style.transform = 'translateX(100px)';
    relativeEl.style.width = '28px';
    const animation = anime({
      targets: relativeEl,
      translateX: '*=2.5', // 100px * 2.5 = '250px',
      width: '-=20px', // 28 - 20 = '8px',
      rotate: '+=2turn', // 0 + 2 = '2turn',
      duration: 10
    });

    expect(relativeEl.style.transform).toBe('translateX(100px) rotate(0turn) ');
    expect(relativeEl.style.width).toBe('28px');

    animation.seek(animation.duration);

    expect(relativeEl.style.transform).toBe('translateX(250px) rotate(2turn) ');
    expect(relativeEl.style.width).toBe('8px');
  });

  test('Relative values inside from to values', () => {
    const relativeEl = document.querySelector('#target-id');
    relativeEl.style.transform = 'translateX(100px)';
    relativeEl.style.width = '28px';
    const animation = anime({
      targets: relativeEl,
      translateX: ['*=2.5', 10], // Relative from value
      width: [100, '-=20px'], // Relative to value
      rotate: ['+=2turn', '-=1turn'], // Relative from and to values
      duration: 10,
    });

    expect(relativeEl.style.transform).toBe('translateX(250px) rotate(2turn) ');
    expect(relativeEl.style.width).toBe('100px');

    animation.seek(animation.duration);

    expect(relativeEl.style.transform).toBe('translateX(10px) rotate(1turn) ');
    expect(relativeEl.style.width).toBe('80px');

  });
});
