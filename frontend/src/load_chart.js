/*
Java script function to draw chart
*/


async function loadChart(canvasID, chartType, chartLabel, chartColor) {
    const error_div = document.getElementById('errors');

    let endpoint = '/api/weather?type=' + chartType;
    
    let data;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            error_div.innerHTML = `<h2 class="error_class">Error fetching chart: HTTP ${res.status}</h2>`;
            return;
        }
        data = await res.json();
    } catch (err) {
        error_div.innerHTML = `<h2 class="error_class">Error: did not receive valid JSON.<br>${err}</h2>`;
        return;
    }
    
    const ctx = document.getElementById(canvasID);
    const labels = data.map(r => r.time);  
    const values = data.map(r => r[chartType]);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: values,
                backgroundColor: [chartColor],
                borderWidth: 1,
                borderColor: chartColor,
                pointRadius: 2,
                pointHoverRadius: 0
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `${chartLabel} Data`,
                    font: { size: 25 }
                },
                legend: {
                    position: 'right',
                    labels: { chartColor: '#000' }
                }
            },
            layout: {
                padding: {
                    left: 50,
                    right: 50,
                    top: 100,
                    bottom: 100
                }
            }
        }
    });
}
