import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchData } from '../utils/storage';

const Chart = ({ selectedUser }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Weight',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
            },
            {
                label: 'Body Fat Percentage',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false,
            },
            {
                label: 'Visceral Fat',
                data: [],
                borderColor: 'rgba(255, 206, 86, 1)',
                fill: false,
            },
        ],
    });

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchData(selectedUser);
            const labels = data.map(entry => entry.date);
            const weightData = data.map(entry => entry.weight);
            const bodyFatData = data.map(entry => entry.bodyFat);
            const visceralFatData = data.map(entry => entry.visceralFat);

            setChartData({
                labels: labels,
                datasets: [
                    { ...chartData.datasets[0], data: weightData },
                    { ...chartData.datasets[1], data: bodyFatData },
                    { ...chartData.datasets[2], data: visceralFatData },
                ],
            });
        };

        loadData();
    }, [selectedUser]);

    return (
        <div>
            <h2>{selectedUser}'s Data Over Time</h2>
            <Line data={chartData} />
        </div>
    );
};

export default Chart;