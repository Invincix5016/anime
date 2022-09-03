describe('Parameters', () => {
  const duration = 10;
  test('Round', () => {
    const animation1 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      duration: duration,
    });
    animation1.seek(duration);
    expect(global.testObject.plainValue).toBe(3.14159265359);

    const animation2 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      duration: duration,
      round: 1
    });
    animation2.seek(duration);
    expect(global.testObject.plainValue).toBe(3);

    const animation3 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      duration: duration,
      round: 10
    });
    animation3.seek(duration);
    expect(global.testObject.plainValue).toBe(3.1);

    const animation4 = anime({
      targets: global.testObject,
      plainValue: 3.14159265359,
      duration: duration,
      round: 1000
    });
    animation4.seek(duration);
    expect(global.testObject.plainValue).toBe(3.142);
  });

  test('Specific property parameters', () => {
    const animation = anime({
      targets: '#target-id',
      translateX: {
        value: 100,
        easing: 'linear',
        round: 10,
        delay: duration * .25,
        duration: duration * .60,
        endDelay: duration * .40
      },
      translateY: 200,
      easing: 'easeOutQuad',
      round: 100,
      delay: duration * .35,
      duration: duration * .70,
      endDelay: duration * .50
    });

    expect(animation.tweens[0].easing(.5)).toBe(0.5);
    expect(animation.tweens[0].round).toBe(10);
    expect(animation.tweens[0].delay).toBe(duration * .25);
    expect(animation.tweens[0].duration).toBe(duration * .60);
    expect(animation.tweens[0].endDelay).toBe(duration * .40);

    expect(animation.tweens[1].easing(.5)).toBe(.75);
    expect(animation.tweens[1].round).toBe(100);
    expect(animation.tweens[1].delay).toBe(duration * .35);
    expect(animation.tweens[1].duration).toBe(duration * .70);
    expect(animation.tweens[1].endDelay).toBe(duration * .50);
  });

  test('0 duration animation', () => {
    const targetEl = document.querySelector('#target-id');
    const animation = anime({
      targets: targetEl,
      translateX: 100,
      easing: 'easeOutQuad',
      duration: 0,
    });

    expect(targetEl.style.transform).toBe('translateX(100px) ');
  });
});
