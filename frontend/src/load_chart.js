/*
Java script functions to draw a chart
*/


/**************** Event listener *************************/

// stores two comma separated iso times
let time_frame = "";
const charts = new Map();


document.addEventListener('DOMContentLoaded', (event) => {
    // Get the dropdown element
    from_date = ""
    to_date = ""

    document.getElementById("apply-button").addEventListener("click", () => {
        const from = document.getElementById("date-from").value;
        const to   = document.getElementById("date-to").value;

        if (!from) {
            from_date = "all"
        }
        if (!to) {
            to_date = "all"
        }
        

    });


    // Add an event listener to the 'change' event
    dropdown.addEventListener('change', function() {
        // 'this.value' refers to the value of the selected option
        let start = new Date();
        let end = new Date();

        offset = this.value;

        start.setDate(start.getDate() - offset);
        end.setDate(end.getDate() - offset - 1);
        start_time = start.toISOString();
        start_time = start_time.split("Z");
        end_time = end.toISOString();
        end_time = end_time.split("Z");

        time_frame = start_time[0] + ',' + end_time[0];

        // Update the display
        if (outputElement) {
            outputElement.textContent = time_frame || 'None';
        }

        // Call other functions as needed

    });

    
});



/**************** Fetch data *************************/


// attempt fetching data
async function fetch_data(endpoint) {
    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            error_div.innerHTML = `<h2 class="error_class">Error fetching chart: HTTP ${res.status}</h2>`;
            return;
        }
        data = await res.json();
        return data;
    } catch (err) {
        error_div.innerHTML = `<h2 class="error_class">Error: did not receive valid JSON.<br>${err}</h2>`;
        return;
    }
    
}


/**************** Load chart *************************/

async function loadChart(canvasID, chartType, chartLabel, chartColor, range="all,all") {
    const error_div = document.getElementById('errors');

    let endpoint = '/api/weather?type=' + chartType //+ '&range=2025-12-12T00:00:00.0,2025-12-13T00:00:00.0';

    data = await fetch_data(endpoint);
    
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

    const existingChart = charts.get(canvasID);

    if (existingChart) {
        // UPDATE
        existingChart.data.labels = labels;
        existingChart.data.datasets[0].data = values;
        existingChart.update();
        return;
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


    charts.set(canvasID, chart);


}



