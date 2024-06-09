import React from 'react';
// import Chart from 'chart.js/auto';

const ChartSection = ({ sectionName }) => {
  // Implement your chart logic here
  return (
    <div>
      <h3>{sectionName}</h3>
      <canvas id={`${sectionName.replace(/\s/g, '')}Chart`} ></canvas>
    </div>
  );
};

export default ChartSection;
