export function getBiorhythms({ day, month, year }, targetDate = new Date()) {
  const birthDate = new Date(year, month - 1, day);
  const daysSinceBirth = Math.floor((targetDate - birthDate) / (1000 * 60 * 60 * 24));

  function cycle(period) {
    const value = Math.sin(2 * Math.PI * daysSinceBirth / period);
    return {
      value: +value.toFixed(4),
      percentage: Math.round((value + 1) * 50),
      phase: value > 0.5 ? 'high' : value < -0.5 ? 'low' : 'transitioning',
      daysSinceBirth,
    };
  }

  const physical     = cycle(23);
  const emotional    = cycle(28);
  const intellectual = cycle(33);

  function chartData(period, days = 30) {
    return Array.from({ length: days }, (_, i) => {
      const d = daysSinceBirth - 15 + i;
      return {
        day: i - 15,
        value: +Math.sin(2 * Math.PI * d / period).toFixed(3),
      };
    });
  }

  function findNextCritical(period) {
    for (let i = 1; i <= period; i++) {
      const prev = Math.sin(2 * Math.PI * (daysSinceBirth + i - 1) / period);
      const curr = Math.sin(2 * Math.PI * (daysSinceBirth + i) / period);
      if (prev * curr < 0) return i;
    }
    return null;
  }

  const criticalDays = {
    physical:     findNextCritical(23),
    emotional:    findNextCritical(28),
    intellectual: findNextCritical(33),
  };

  const overallEnergy = Math.round(
    (Math.abs(physical.value) + Math.abs(emotional.value) + Math.abs(intellectual.value)) / 3 * 100
  );

  return {
    date: targetDate.toISOString().split('T')[0],
    daysSinceBirth,
    cycles: { physical, emotional, intellectual },
    chartData: {
      physical:     chartData(23),
      emotional:    chartData(28),
      intellectual: chartData(33),
    },
    criticalDays,
    overallEnergy,
    insight: getInsight(physical, emotional, intellectual),
  };
}

function getInsight(physical, emotional, intellectual) {
  const high = [];
  const low  = [];
  if (physical.phase     === 'high') high.push('physical energy');
  if (emotional.phase    === 'high') high.push('emotional receptivity');
  if (intellectual.phase === 'high') high.push('mental clarity');
  if (physical.phase     === 'low')  low.push('physical energy');
  if (emotional.phase    === 'low')  low.push('emotional stability');
  if (intellectual.phase === 'low')  low.push('mental acuity');

  if (high.length === 3) return 'Peak day — all three cycles are elevated. Ideal for challenges requiring full capacity.';
  if (low.length  === 3) return 'Rest day — all cycles are low. Honor the need for recovery and introspection.';
  if (high.length > 0 && low.length > 0) return `Strong ${high.join(' and ')} today, but conserve ${low.join(' and ')}.`;
  if (high.length > 0) return `Elevated ${high.join(' and ')} — good day to leverage these strengths.`;
  return 'Transitional day — cycles are crossing zero. Extra care and flexibility recommended.';
}
