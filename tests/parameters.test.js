describe('Parameters', () => {
  test('Round', () => {
    const animation1 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359
    });
    animation1.seek(1000);
    expect(animation1.tweens[0].currentValue).toBe(3.14159265359);

    const animation2 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      round: 1
    });
    animation2.seek(1000);
    expect(animation2.tweens[0].currentValue).toBe(3);

    const animation3 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      round: 10
    });
    animation3.seek(1000);
    expect(animation3.tweens[0].currentValue).toBe(3.1);

    const animation4 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      round: 1000
    });
    animation4.seek(1000);
    expect(animation4.tweens[0].currentValue).toBe(3.142);
  });

  test('Specific property parameters', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: {
        value: 100,
        easing: 'linear',
        round: 10,
        delay: 250,
        duration: 600,
        endDelay: 400
      },
      translateY: 200,
      easing: 'easeOutQuad',
      round: 100,
      delay: 350,
      duration: 700,
      endDelay: 500
    });

    expect(animation.tweens[0].easing(.5)).toBe(0.5);
    expect(animation.tweens[0].round).toBe(10);
    expect(animation.tweens[0].delay).toBe(250);
    expect(animation.tweens[0].duration).toBe(600);
    expect(animation.tweens[0].endDelay).toBe(400);

    expect(animation.tweens[1].easing(.5)).toBe(.75);
    expect(animation.tweens[1].round).toBe(100);
    expect(animation.tweens[1].delay).toBe(350);
    expect(animation.tweens[1].duration).toBe(700);
    expect(animation.tweens[1].endDelay).toBe(500);
  });

  test('0 duration animation', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      easing: 'easeOutQuad',
      duration: 0,
    });

    expect(animation.tweens[0].currentValue).toBe('100px');
  });
});
