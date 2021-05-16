import React from 'react';

function Circle(props: { radius: number; stroke: number; progress: number }) {
  const { radius, stroke, progress } = props;

  const normalizedRadius: number = radius - stroke * 2;
  const circumference: number = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset: number =
    circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="white"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

export default React.memo(Circle);
