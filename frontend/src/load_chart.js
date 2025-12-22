/*
Java script function to draw chart
*/


// fetch data and load chart
async function loadChart(canvasID, chartType, chartLabel, chartColor) {
    const error_div = document.getElementById('errors');

    let endpoint = '/api/weather?type=' + chartType //+ '&range=2025-12-12T00:00:00.0,2025-12-13T00:00:00.0';
    
    // attempt fetching data
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
    // move values from json to array
    const labels_iso = data.map(r => r.time);  
    let values = data.map(r => r[chartType]);

    let labels = [];
    
    // change iso format date time objects to local times
    for (let i = 0; i < labels_iso.length; i++){
        const date = new Date(labels_iso[i]);
        labels.push(date.toLocaleString());
    }

    // load chart
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
                pointRadius: 0,
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
