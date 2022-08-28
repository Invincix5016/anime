describe('Directions', () => {
  test('Forward', resolve => {
    anime({
      targets: '#target-id',
      translateX: 100,
      direction: 'normal',
      duration: 10,
      complete: (a) => {
        expect(a.progress).toEqual(1);
        resolve();
      },
    });
  });

  test('Reverse', resolve => {
    anime({
      targets: '#target-id',
      translateX: 100,
      direction: 'reverse',
      duration: 10,
      complete: (a) => {
        expect(a.progress).toEqual(0);
        resolve();
      },
    });
  });

  test('Alternate', resolve => {
    anime({
      targets: '#target-id',
      translateX: 100,
      direction: 'alternate',
      duration: 10,
      loopComplete: (a) => {
        expect(a.progress).toEqual(a.remainingIterations ? 1 : 0);
      },
      complete: (a) => {
        expect(a.progress).toEqual(0);
        resolve();
      },
    });
  });
});
