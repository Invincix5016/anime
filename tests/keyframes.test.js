import {
  valueTypes,
} from '../src/consts.js';

describe('Keyframes', () => {
  test('An array of one raw value should be considered as a simple value', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [50]
    });

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[0].to.number).toBe(50);
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[0].to.unit).toBe('px');
  });

  test('An array of two raw values should be converted to "From To" values', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [-100, 100]
    });

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(-100);
    expect(animation.tweens[0].to.number).toBe(100);
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[0].to.unit).toBe('px');
  });

  test('An array of more than two raw values should be converted to keyframes', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [-100, 100, 50]
    });

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[0].to.number).toBe(-100);
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[0].to.unit).toBe('px');

    expect(animation.tweens[1].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].from.number).toBe(-100);
    expect(animation.tweens[1].to.number).toBe(100);
    expect(animation.tweens[1].from.unit).toBe('px');
    expect(animation.tweens[1].to.unit).toBe('px');

    expect(animation.tweens[2].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[2].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[2].from.number).toBe(100);
    expect(animation.tweens[2].to.number).toBe(50);
    expect(animation.tweens[2].from.unit).toBe('px');
    expect(animation.tweens[2].to.unit).toBe('px');
  });

  test('An array of two object values should be converted to keyframes', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        { value: -100 },
        { value: 100 }
      ]
    });

    expect(animation.tweens[0].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[0].to.number).toBe(-100);
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[0].to.unit).toBe('px');

    expect(animation.tweens[1].from.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].to.type).toBe(valueTypes.UNIT);
    expect(animation.tweens[1].from.number).toBe(-100);
    expect(animation.tweens[1].to.number).toBe(100);
    expect(animation.tweens[1].from.unit).toBe('px');
    expect(animation.tweens[1].to.unit).toBe('px');
  });

  test('Unspecified keyframe duration should be inherited from instance duration and devided by the number of keyframes', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        { value: -100, duration: 800 },
        { value: 100 },
        { value: 50 },
        { value: 0, duration: 1200 }
      ],
      duration: 2000
    });

    expect(animation.tweens[0].duration).toBe(800); // Specified duration
    expect(animation.tweens[1].duration).toBe(500); // 2000 / 4
    expect(animation.tweens[2].duration).toBe(500); // 2000 / 4
    expect(animation.tweens[3].duration).toBe(1200); // Specified duration
  });

  test('First keyframe should inherit instance\'s delay', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        { value: -100 },
        { value: 100 },
      ],
      delay: 200,
      endDelay: 400
    });

    expect(animation.tweens[0].delay).toBe(200);
    expect(animation.tweens[1].delay).toBe(0);
  });

  test('Last keyframe should inherit instance\'s endDelay', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        { value: -100 },
        { value: 100 },
      ],
      delay: 200,
      endDelay: 400
    });

    expect(animation.tweens[0].endDelay).toBe(0);
    expect(animation.tweens[1].endDelay).toBe(400);
  });

  test('General keyframes instance parameters inheritance', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        { value: -100 },
        { value: 100, duration: 100, delay: 300, endDelay: 600, easing: 'linear', round: 10 },
        { value: 50 },
      ],
      translateY: [
        { value: -200 },
        { value: 200 },
        { value: 100 },
      ],
      duration: 1500,
      delay: 200,
      endDelay: 400,
      round: 5,
      easing: 'easeOutQuad',
    });

    expect(animation.tweens[0].duration).toBe(500); // 1500 / 3
    expect(animation.tweens[0].delay).toBe(200); // Inherited because its the first keyframe
    expect(animation.tweens[0].endDelay).toBe(0); // Not inherited because not last keyframe
    expect(animation.tweens[0].easing(.5)).toBe(.75);
    expect(animation.tweens[0].round).toBe(5);

    expect(animation.tweens[1].duration).toBe(100);
    expect(animation.tweens[1].delay).toBe(300);
    expect(animation.tweens[1].endDelay).toBe(600);
    expect(animation.tweens[1].easing(.5)).toBe(.5);
    expect(animation.tweens[1].round).toBe(10);

    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[0].to.number).toBe(-100);
    expect(animation.tweens[1].from.number).toBe(-100);
    expect(animation.tweens[1].to.number).toBe(100);
    expect(animation.tweens[2].from.number).toBe(100);
    expect(animation.tweens[2].to.number).toBe(50);

    expect(animation.tweens[3].from.number).toBe(0);
    expect(animation.tweens[3].to.number).toBe(-200);
    expect(animation.tweens[4].from.number).toBe(-200);
    expect(animation.tweens[4].to.number).toBe(200);
    expect(animation.tweens[5].from.number).toBe(200);
    expect(animation.tweens[5].to.number).toBe(100);
  });

  test('Keyframes parameters inheritance', () => {
    const animation = anime({
      targets: '#target-id',
      keyframes: [
        { translateY: -40 },
        { translateX: 250, duration: 100, delay: 300, endDelay: 600, easing: 'linear', round: 10 },
        { translateY: 40 },
        { translateX: 0 },
        { translateY: 0 }
      ],
      duration: 1500,
      delay: 200,
      endDelay: 400,
      round: 5,
      easing: 'easeOutQuad',
    });

    expect(animation.tweens[0].duration).toBe(300); // 1500 / 5
    expect(animation.tweens[0].delay).toBe(200); // Inherited because its the first keyframe
    expect(animation.tweens[0].endDelay).toBe(0); // Not inherited because not last keyframe
    expect(animation.tweens[0].easing(.5)).toBe(.75);
    expect(animation.tweens[0].round).toBe(5);

    expect(animation.tweens[1].duration).toBe(100);
    expect(animation.tweens[1].delay).toBe(300);
    expect(animation.tweens[1].endDelay).toBe(600);
    expect(animation.tweens[1].easing(.5)).toBe(.5);
    expect(animation.tweens[1].round).toBe(10);

    // translateY
    expect(animation.tweens[0].from.number).toBe(0);
    expect(animation.tweens[0].to.number).toBe(-40);
    expect(animation.tweens[1].from.number).toBe(-40);
    expect(animation.tweens[1].to.number).toBe(-40);
    expect(animation.tweens[2].from.number).toBe(-40);
    expect(animation.tweens[2].to.number).toBe(40);
    expect(animation.tweens[3].from.number).toBe(40);
    expect(animation.tweens[3].to.number).toBe(40);
    expect(animation.tweens[4].from.number).toBe(40);
    expect(animation.tweens[4].to.number).toBe(0);

    // translateX
    expect(animation.tweens[5].from.number).toBe(0);
    expect(animation.tweens[5].to.number).toBe(0);
    expect(animation.tweens[6].from.number).toBe(0);
    expect(animation.tweens[6].to.number).toBe(250);
    expect(animation.tweens[7].from.number).toBe(250);
    expect(animation.tweens[7].to.number).toBe(250);
    expect(animation.tweens[8].from.number).toBe(250);
    expect(animation.tweens[8].to.number).toBe(0);
    expect(animation.tweens[9].from.number).toBe(0);
    expect(animation.tweens[9].to.number).toBe(0);
  });

  test('Keyframes units inheritance', () => {
    const el = document.querySelector('#target-id');
    const animation = anime({
      targets: el,
      translateX: [
        { value: [-20, -40] },
        { value: '5rem' },
        { value: '100%' },
        { value: 0 },
        { value: '10%' },
        { value: [50, 200] },
        { value: [25, '100px'] },
      ],
    });

    expect(animation.tweens[0].from.unit).toBe('px'); // inherit px
    expect(animation.tweens[0].to.unit).toBe('px');
    expect(animation.tweens[1].from.unit).toBe('rem'); // switch to rem
    expect(animation.tweens[1].to.unit).toBe('rem'); // switch to rem
    expect(animation.tweens[2].from.unit).toBe('%'); // switch to %
    expect(animation.tweens[2].to.unit).toBe('%'); // switch to %
    expect(animation.tweens[3].from.unit).toBe('%'); // inherit %
    expect(animation.tweens[3].to.unit).toBe('%'); // inherit %
    expect(animation.tweens[4].from.unit).toBe('%'); // switch back to %
    expect(animation.tweens[4].to.unit).toBe('%'); // switch back to %
    expect(animation.tweens[5].from.unit).toBe('%');
    expect(animation.tweens[5].to.unit).toBe('%');
    expect(animation.tweens[6].from.unit).toBe('px'); // switch to px
    expect(animation.tweens[6].to.unit).toBe('px'); // switch to px

    expect(el.style.transform).toBe('translateX(-20px) ');

  });

});
