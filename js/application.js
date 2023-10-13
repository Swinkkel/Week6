const jsonQuery = {
    "query": [
        {
            "code": "Vuosi",
            "selection": {
                "filter": "item",
                "values": [
                    "2000",
                    "2001",
                    "2002",
                    "2003",
                    "2004",
                    "2005",
                    "2006",
                    "2007",
                    "2008",
                    "2009",
                    "2010",
                    "2011",
                    "2012",
                    "2013",
                    "2014",
                    "2015",
                    "2016",
                    "2017",
                    "2018",
                    "2019",
                    "2020",
                    "2021"
                ]
            }
        },
        {
            "code": "Alue",
            "selection": {
                "filter": "item",
                "values": [
                    "SSS"
                ]
            }
        },
        {
            "code": "Tiedot",
            "selection": {
                "filter": "item",
                "values": [
                    "vaesto"
                ]
            }
        }
    ],
    "response": {
        "format": "json-stat2"
    }
}

let kunta = "Whole country";
let chart;

const getKunnat = async () => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

    const res = await fetch(url);

    if (!res.ok) {
        return;
    }
    const data = await res.json()

    return data
}

const getData = async (query) => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

    const res = await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify(query)
    })

    if (!res.ok) {
        return;
    }
    const data = await res.json()

    return data
}

const buildChart = async () => {
    console.log(kunta);

    // Now we need those kunta names and codes.
    const kunnat = await getKunnat();
    console.log(kunnat);

    kunta_alueet = Object.values(kunnat.variables[1]);
    const index = kunta_alueet[3].findIndex(element => element.toUpperCase() === kunta.toUpperCase());
    console.log(index);

    kunta_code = kunta_alueet[2][index];

    console.log();

    let modifiedQuery = jsonQuery;
    modifiedQuery.query[1].selection.values = [kunta_code];

    const data = await getData(modifiedQuery)
    console.log(data);

    const parties = Object.values(data.dimension.Alue.category.label);
    const years = Object.values(data.dimension.Vuosi.category.label);
    const values = data.value;

    parties.forEach((party, index) => {
        let partySupport = []
        for(let i = 0; i < years.length; i++) {
            partySupport.push(values[i])
        }
        parties[index] = {
            name: party,
            values: partySupport
        }
    })

    const chartData = {
        labels: years,
        datasets: parties
    }

    chart = new frappe.Chart("#chart", {
        title: "Population growth in whole country",
        data: chartData,
        type: "line",
        height: 450,
        colors: ['#eb5146'],
    })
}

// Setup navigation button
const nav_btn = document.getElementById("navigation");
nav_btn.addEventListener("click", function() {

    fullURL = window.location.href;
    pageOnly = fullURL.replace(window.location.origin, '');
    
    console.log(pageOnly);

    if (pageOnly === "/index.html")
        window.location.href = "/newchart.html";
    else if (pageOnly === "/newchart.html")
        window.location.href = "/index.html";
});

// Setup submit-data button
const submit_btn = document.getElementById("submit-data");
submit_btn.addEventListener("click", function() {
    const input_area_fill = document.getElementById("input-area");
    kunta = input_area_fill.value;
    if (kunta === null || kunta === '') {
        kunta = "Whole country";
    }

    buildChart();
});

// Add estimated data.
const add_data_btn = document.getElementById("add-data");
add_data_btn.addEventListener("click", function() {
    const data = chart.data.datasets[0].values;
 
    // Calculate the mean value of the delta
    let deltaSum = 0;
    for (let i = 1; i < data.length; i++) {
        deltaSum += data[i] - data[i - 1];
    }

    let meanDelta = deltaSum / (data.length - 1);
        
    chart.addDataPoint('2022', [data[data.length - 1] + meanDelta]);
});

buildChart()

