describe('Units', () => {
  test('Default transform units', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      translateY: 100,
      translateZ: 100,
      rotate: 360,
      rotateX: 360,
      rotateY: 360,
      rotateZ: 360,
      skew: 360,
      skewX: 360,
      skewY: 360,
      perspective: 1000,
    });

    // Translate
    expect(animation.tweens[0].from.unit).toBe('px');
    expect(animation.tweens[1].from.unit).toBe('px');
    expect(animation.tweens[2].from.unit).toBe('px');
    // Rotate
    expect(animation.tweens[3].from.unit).toBe('deg');
    expect(animation.tweens[4].from.unit).toBe('deg');
    expect(animation.tweens[5].from.unit).toBe('deg');
    expect(animation.tweens[6].from.unit).toBe('deg');
    // Skew
    expect(animation.tweens[7].from.unit).toBe('deg');
    expect(animation.tweens[8].from.unit).toBe('deg');
    expect(animation.tweens[9].from.unit).toBe('deg');
    // Perspective
    expect(animation.tweens[10].from.unit).toBe('px');
  });

  test('Specified unit on a simple tween', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: '100%',
    });

    expect(animation.tweens[0].to.unit).toBe('%');
  });

  test('Units inheritance on From To Values', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: [-50, '50%'],
    });

    expect(animation.tweens[0].from.unit).toBe('%');
    expect(animation.tweens[0].to.unit).toBe('%');
  });
});
