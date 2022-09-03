describe('Timings', () => {
  test('Default timings parameters', resolve => {
    let currentTime = 0;
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      update: a => {
        currentTime = a.currentTime;
      },
      complete: () => {
        expect(currentTime).toEqual(1000);
        resolve();
      },
    });
  });

  test('Specified timings parameters', resolve => {
    let currentTime = 0;
    const animation = anime({
      targets: '#target-id',
      translateX: 100,
      delay: 10,
      duration: 20,
      endDelay: 30,
      update: a => {
        currentTime = a.currentTime;
      },
      complete: () => {
        expect(currentTime).toEqual(60);
        resolve();
      },
    });
  });

  const complexTimingsParams = {
    targets: '#target-id',
    translateX: {
      value: 50,
      delay: () => 15,
      duration: () => 10,
      endDelay: () => 20
    },
    translateY: {
      value: 35,
      delay: 10,
      duration: 10,
      endDelay: 50
    },
    translateZ: {
      value: 20,
      delay: 35,
      duration: 30,
      endDelay: 40
    },
    delay: () => 10,
    duration: () => 10,
    endDelay: () => 50
  };

  test('changeStartTime must be equal to the smallest delay of the all the animations', () => {
    const animation = anime(complexTimingsParams);
    expect(animation._changeStartTime).toBe(10);
    expect(animation.currentTime).toBe(0);
    animation.seek(5)
    expect(animation.currentTime).toBe(5);
    animation.seek(animation.duration - 5)
    expect(animation.currentTime).toBe(animation.duration - 5);
    animation.seek(animation.duration)
    expect(animation.currentTime).toBe(animation.duration);

  });

  test('Duration must be the longest delay + duration of the all the animations', () => {
    const animation = anime(complexTimingsParams);
    expect(animation.duration).toBe(105);
  });

  test('changeEndTime must be equal to the smallest endDelay from the the longest animation', () => {
    const animation = anime(complexTimingsParams);
    expect(animation._changeEndTime).toBe(40);
  });
});
