// TableList.js
import React, { useState, useEffect, useRef  } from 'react';
import Chart from 'chart.js/auto';

const TableList = () => {
  const [tables, setTables] = useState([]);
  const chartRef = useRef(null);

  const x = async function (){
    fetch('http://localhost:5000/tables' )
    .then(res => res.json())
    .then(d =>{
       console.log(d)
        let arr = []
        // d.forEach(e => {
        //     arr.push({
        //         id: e.id,
        //         todo:e.todo,
        //         completed:e.completed,
        //         owner: e.owner
        //     })
        // });
        setTables(arr)
    })
       
   }


   useEffect(() => {
    x();
   },[])


   useEffect(() => {
    // Cleanup previous chart before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Example: create a bar chart
    const ctx = document.getElementById('myChart').getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tables.map(table => table.name),
        datasets: [{
          label: 'Number of Entries',
          data: tables.map(table => table.entries.length),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }],
      },
    });

    // Save the chart reference to be able to destroy it later
    chartRef.current = newChart;
  }, [tables]);

  return (
    <div>
      <h2>Available Tables</h2>
      <ul>
        {tables.map(table => (
          <li key={table.id}>{table.name}</li>
        ))}
      </ul>
      <canvas id="myChart" width="400" height="200"></canvas>
    </div>
  );
};

export default TableList;
