/*
JavaScript functions to draw a chart
*/

/**************** Event listener *************************/

// stores two comma separated iso times
let time_frame = "all,all";
const charts = new Map();
const chartConfigs = [];


document.addEventListener('DOMContentLoaded', () => {
    
    reloadAllCharts();

    const outputElement = document.getElementById("output");
    const dropdown = document.getElementById("dropdown"); 
    const applyBtn = document.getElementById("apply-button");

    applyBtn.addEventListener("click", () => {
        const from = document.getElementById("date-from").value;
        const to   = document.getElementById("date-to").value;

        setTimeFrame(from, to);
        if (outputElement) {
            outputElement.textContent = time_frame;
        }

        reloadAllCharts();
    });


    dropdown.addEventListener("change", function () {
        if(!this.value) {
            return;
        }
        const offset = Number(this.value);
        const now = new Date();

        const start = new Date(now);
        const end   = new Date(now);

        start.setDate(now.getDate() - offset);

        setTimeFrame(start, end);


        if (outputElement) {
            outputElement.textContent = time_frame;
        }

        reloadAllCharts();
    });


});

/**************** Fetch data *************************/

async function fetch_data(endpoint) {
    const error_div = document.getElementById('errors'); // FIX: scope

    try {
        const res = await fetch(endpoint);
        if (!res.ok) {
            error_div.innerHTML =
                `<h2 class="error_class">Error fetching chart: HTTP ${res.status}</h2>`;
            return null;
        }
        return await res.json();
    } catch (err) {
        error_div.innerHTML =
            `<h2 class="error_class">Error: did not receive valid JSON.<br>${err}</h2>`;
        return null;
    }
}

/***************** Update Charts *************************/
function reloadAllCharts() {
    for (const cfg of chartConfigs) {
        loadChart(
            cfg.canvasID,
            cfg.chartType,
            cfg.chartLabel,
            cfg.chartColor,
            time_frame
        );
    }
}

/***************** Time frame handling *************************/
function setTimeFrame(from = 'all', to = 'all') {

    const normalize = (v) => {
        if (!v || v === 'all') return 'all';
        if (v instanceof Date) {
            return v.toISOString().split('Z')[0];
        }
        // assume YYYY-MM-DD string
        return new Date(v).toISOString().split('Z')[0];
    };

    const fromISO = normalize(from);
    const toISO   = normalize(to);

    time_frame = `${fromISO},${toISO}`;
}


/**************** Load chart *************************/

async function loadChart(canvasID, chartType, chartLabel, chartColor, range = "all,all") {
    const endpoint = `/api/weather?type=${chartType}&range=${range}`;
    const data = await fetch_data(endpoint); // FIX: avoid implicit global

    if (!data) return;

    const ctx = document.getElementById(canvasID);

    const labels = data.map(r =>
        new Date(r.time).toLocaleString()
    );
    const values = data.map(r => r[chartType]);

    const existingChart = charts.get(canvasID);

    if (existingChart) {
        existingChart.data.labels = labels;
        existingChart.data.datasets[0].data = values;
        existingChart.update();
        return;
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: chartLabel,
                data: values,
                backgroundColor: [chartColor],
                borderColor: chartColor,
                borderWidth: 1,
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
                    position: 'right'
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
