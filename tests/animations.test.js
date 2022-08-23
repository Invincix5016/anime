import {
  animationTypes,
} from '../src/consts.js';

describe('Animations', () => {

  // Animation types

  test('Get attribute animation type with SVG attribute values', () => {
    const animation = anime({
      targets: '#svg-element path',
      stroke: '#FFFFFF',
      d: 'M80 20c-30 0 0 30-30 30'
    });

    expect(animation.animations[0].tweens[0].type).toBe(animationTypes.ATTRIBUTE);
    expect(animation.animations[1].tweens[0].type).toBe(animationTypes.ATTRIBUTE);
  });

  test('Get attribute animation type with DOM attribute values', () => {
    const animation = anime({
      targets: '.with-width-attribute',
      width: 100,
    });

    expect(animation.animations[0].tweens[0].type).toBe(animationTypes.ATTRIBUTE);
  });

  test('Get transform animation type with mixed transforms values', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 100,
      rotateX: 100,
      rotateY: 100,
      rotateZ: 100,
      scale: 100,
      scaleX: 100,
      scaleY: 100,
      scaleZ: 100,
      skew: 100,
      skewX: 100,
      skewY: 100,
      perspective: 100,
      matrix: 100,
      matrix3d: 100,
    });

    animation.animations.forEach( a => {
      expect(a.tweens[0].type).toBe(animationTypes.TRANSFORM);
    });
  });

  test('Get CSS animation type with mixed values', () => {
    const animation = anime({
      targets: '.with-inline-styles',
      width: 50,
      height: 50,
      fontSize: 50,
      backgroundColor: '#FFF',
    });

    animation.animations.forEach( a => {
      expect(a.tweens[0].type).toBe(animationTypes.CSS);
    });
  });

  test('Get attribute animation type with input values', () => {
    const animation = anime({
      targets: '#input-number',
      value: 50,
    });

    expect(animation.animations[0].tweens[0].type).toBe(animationTypes.ATTRIBUTE);
  });

  test('Get Object animation type with plain JS object values', () => {
    const animation = anime({
      targets: testObject,
      plainValue: 20,
      valueWithUnit: '20px',
      multiplePLainValues: '32 64 128 256',
      multipleValuesWithUnits: '32px 64em 128% 25ch'
    });

    animation.animations.forEach( a => {
      expect(a.tweens[0].type).toBe(animationTypes.OBJECT);
    });
  });

  test('Get Object animation type with DOM properties that can\'t be accessed with getAttribute()', () => {
    const animation = anime({
      targets: '#target-id',
      innerHTML: 9999,
    });

    expect(animation.animations[0].tweens[0].type).toBe(animationTypes.OBJECT);
  });

  test('Animation\'s tweens timing inheritance', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [
        {
          value: 50,
          delay: 150,
          duration: 100,
          endDelay: 200
        }, {
          value: 200,
          delay: 350,
          duration: 300,
          endDelay: 400
        }, {
          value: 350,
          delay: 150,
          duration: 100,
          endDelay: 500
        }
      ]
    });

    expect(animation.animations[0].delay).toBe(150);
    expect(animation.animations[0].duration).toBe(150 + 100 + 200 + 350 + 300 + 400 + 150 + 100 + 500);
    expect(animation.animations[0].endDelay).toBe(500);
  });
});
