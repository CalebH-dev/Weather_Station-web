/*
JavaScript functions to draw a chart
*/

/**************** Event listener *************************/

// stores two comma separated iso times
let time_frame = "all,all";
const charts = new Map();
const chartConfigs = [];


document.addEventListener('DOMContentLoaded', () => {
    let from_date = "all";
    let to_date   = "all";

    const outputElement = document.getElementById("output");
    const dropdown = document.getElementById("dropdown"); // FIX: was undefined
    const applyBtn = document.getElementById("apply-button");

    applyBtn.addEventListener("click", () => {
        const from = document.getElementById("date-from").value;
        const to   = document.getElementById("date-to").value;

        from_date = from || "all";
        to_date   = to   || "all";

        time_frame = `${from_date},${to_date}`;
        if (outputElement) {
            outputElement.textContent = time_frame;
        }

        reloadAllCharts();
    });


    dropdown.addEventListener("change", function () {
        const offset = Number(this.value);
        const now = new Date();

        const start = new Date(now);
        const end   = new Date(now);

        start.setDate(now.getDate() - offset);
        end.setDate(now.getDate() - offset - 1);

        setTimeFrame(
            start.toISOString().split("Z")[0],
            end.toISOString().split("Z")[0]
        );


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
