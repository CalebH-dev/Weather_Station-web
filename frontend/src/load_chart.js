
async function loadChart() {
    const error_div = document.getElementById('errors');
    
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    let endpoint = '/api/weather'; // default
    let dataKey = 'temp';  // Changed to lowercase
    let label = 'Temperature';
    let color = 'green';
    
    if (currentPage === 'Preasure.html') {
        endpoint = '/api/weather?type=pressure';
        dataKey = 'pressure';  // Changed to lowercase
        label = 'Pressure';
        color = 'blue';
    } else if (currentPage === 'Humidity.html') {
        endpoint = '/api/weather?type=humidity';
        dataKey = 'humidity';  // Changed to lowercase
        label = 'Humidity';
        color = 'orange';
    }
    
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
    
    const ctx = document.getElementById('myChart');
    const labels = data.map(r => r.time);  // Changed to lowercase
    const values = data.map(r => r[dataKey]);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: values,
                backgroundColor: [color],
                borderWidth: 2,
                borderColor: color
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `${label} Data`,
                    font: { size: 25 }
                },
                legend: {
                    position: 'right',
                    labels: { color: '#000' }
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

loadChart();