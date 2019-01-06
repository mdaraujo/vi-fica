const margin = 80;
const height = window.innerHeight / 2 - 2 * margin;

let cols = ["Numero", "Nome", "CursoNome", "AnoLetivoMatricula", "EstadoMatricula", "AnoCurricular",
    "IND2_1", "ECTS_InscritosAnoAtual", "ECTS_InscritoAnoAtualSemestre1", "ECTS_FeitosAnoAtual",
    "IND2_2", "Propina_TotalEmDivida",
    "IND2_3", "BolsaSAS_EstadoBolsa",
    "IND2_4", "IngressoRG_nota",
    "IND2_5", "NumUCinscritas", "UC1_Assiduidade", "UC2_Assiduidade", "UC3_Assiduidade", "UC4_Assiduidade", "UC5_Assiduidade"];

function tabulate(data, columns) {
    var table = d3.select('table');
    table.selectAll("*").remove();
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(columns).enter()
        .append('th')
        .text(function (column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return { column: column, value: row[column] };
            });
        })
        .enter()
        .append('td')
        .text(function (d) { return d.value; });

    $('table').on('scroll', function () {
        $("#studentsTable > *").width($(this).width() + $(this).scrollLeft());
    });
    $("#studentsTable").scrollLeft(0);

    return table;
}


function createBarChart(chartDivId, fullXData, yData, totalEntries, items, colors, xLabel, yLabel, title, subchartDivId, subData, subItems, subXData, subColors) {
    $(chartDivId).html('');
    let xData = fullXData.map(function (item) { return item.split(' ')[0]; });
    let width = $(chartDivId).width() - 2 * margin;
    const svg = d3.select(chartDivId)
        .append("svg")
        .attr("width", width + 1.2 * margin)
        .attr("height", height + 2 * margin);

    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(xData)
        .padding(0.4);

    var yExtent = d3.extent(yData, function (d) { return d });

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yExtent[1]]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale);

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    const bars = chart.selectAll()
        .data(yData)
        .enter()
        .append('g')
        .style("cursor", "pointer")
        .on('mouseenter', mainChartBarEnter)
        .on('mouseleave', mainChartBarLeave)
        .on('click', mainChartBarClick);

    bars.append('rect')
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", (d, i) => colors[i])
        .attr('x', (d, i) => xScale(xData[i]))
        .attr('y', (d) => yScale(d))
        .attr('height', (d) => height - yScale(d))
        .attr('width', xScale.bandwidth());

    bars.append('text')
        .attr('class', 'value')
        .attr('x', (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d) - 20)
        .attr('text-anchor', 'middle')
        .text((d) => d)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("fill", "black");

    bars.append('text')
        .attr('class', 'value')
        .attr('x', (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d) - 5)
        .attr('text-anchor', 'middle')
        .text((function (d, i) {
            if (!Array.isArray(totalEntries))
                return `(${(d / totalEntries * 100).toFixed(1)}%)`;
            else
                return `(${(d / totalEntries[i] * 100).toFixed(1)}%)`;
        }))
        .style("font-size", "12px")
        .attr("fill", "black");

    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat(''));

    if (!Array.isArray(totalEntries)) {
        svg.append("text")
            .text("# Alunos: " + totalEntries)
            .attr('x', margin * 0.2)
            .attr('y', margin * 0.25)
            .attr("fill", "black");
    }

    svg.append("text")
        .text(xLabel)
        .attr("x", width / 2 + margin)
        .attr("y", height + 1.7 * margin)
        .attr("text-anchor", "middle")
        .attr("fill", "black");

    svg.append("text")
        .text(yLabel)
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.8)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr("fill", "black");

    svg.append("text")
        .text(title)
        .attr("x", width / 2 + margin)
        .attr("y", margin * 0.3)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle");

    function mainChartBarClick(actual, i) {
        if (actual > 0) {
            $('#studentsTable').html('');
            $('#loading_table').show();
            d3.select(this.parentNode).selectAll("rect").attr("stroke-width", 0);
            d3.select(this).selectAll("rect").attr("stroke-width", 4);
            setTimeout(function () {
                if (subchartDivId) createAuxChart(subchartDivId, subXData, subColors, subData[i], subItems[i], 'Distribuição para ' + fullXData[i], yData[i])
                tabulate(items[i], cols);
                $('#loading_table').hide();
            }, 500);
        }
    }

    function mainChartBarEnter(actual, i) {
        d3.select(this).selectAll("rect")
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', xScale(xData[i]) - 5)
            .attr('width', xScale.bandwidth() + 10);
    }

    function mainChartBarLeave(actual, i) {
        d3.select(this).selectAll("rect")
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', xScale(xData[i]))
            .attr('width', xScale.bandwidth());
    }

}


function createAuxChart(chartDivId, xData, colors, data, items, title, totalEntries){
    $(chartDivId).html('');
    let width = $(chartDivId).width() - 2 * margin;
    let yData = [];
    for (let i = 0; i < xData.length; i++) {
        if (data.has(xData[i])) {
            yData.push(data.get(xData[i]));
        }else{
            yData.push( 0 );
        }
    }
    $(chartDivId).html('');
    const svg = d3.select(chartDivId)
        .append("svg")
        .attr("width", width + 1.2 * margin)
        .attr("height", height + 2 * margin);

    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(xData)
        .padding(0.4);

    var yExtent = d3.extent(yData, function (d) { return d });

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yExtent[1]]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale);

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    const bars = chart.selectAll()
        .data(yData)
        .enter()
        .append('g')
        .style("cursor", "pointer")
        .on('mouseenter', auxChartBarEnter)
        .on('mouseleave', auxChartBarLeave)
        .on('click', auxChartBarClick);

    bars.append('rect')
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("fill", (d, i) => colors[i])
        .attr('x', (d, i) => xScale(xData[i]))
        .attr('y', (d) => yScale(d))
        .attr('height', (d) => height - yScale(d))
        .attr('width', xScale.bandwidth());

    bars.append('text')
        .attr('class', 'value')
        .attr('x', (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d) - 20)
        .attr('text-anchor', 'middle')
        .text((d) => d)
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .attr("fill", "black");

    bars.append('text')
        .attr('class', 'value')
        .attr('x', (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d) - 5)
        .attr('text-anchor', 'middle')
        .text((function (d, i) {
            if (!Array.isArray(totalEntries))
                return `(${(d / totalEntries * 100).toFixed(1)}%)`;
            else
                return `(${(d / totalEntries[i] * 100).toFixed(1)}%)`;
        }))
        .style("font-size", "12px")
        .attr("fill", "black");

    chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat(''));

    svg.append("text")
        .text('Indicadores')
        .attr("x", width / 2 + margin)
        .attr("y", height + 1.7 * margin)
        .attr("text-anchor", "middle")
        .attr("fill", "black");

    svg.append("text")
        .text('Nº de Alunos')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.8)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr("fill", "black");

    svg.append("text")
        .text(title)
        .attr("x", width / 2 + margin)
        .attr("y", margin * 0.3)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle");

    function auxChartBarClick(actual, i) {
        if (actual > 0) {
            $('#studentsTable').html('');
            $('#loading_table').show();
            d3.select(this.parentNode).selectAll("rect").attr("stroke-width", 0);
            d3.select(this).selectAll("rect").attr("stroke-width", 4);
            setTimeout(function () {
                tabulate(items.get(xData[i]), cols);
                $('#loading_table').hide();
            }, 500);
        }
    }

    function auxChartBarEnter(actual, i) {
        d3.select(this).selectAll("rect")
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', xScale(xData[i]) - 5)
            .attr('width', xScale.bandwidth() + 10);
    }

    function auxChartBarLeave(actual, i) {
        d3.select(this).selectAll("rect")
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', xScale(xData[i]))
            .attr('width', xScale.bandwidth());
    }
}


function createLineGraph(graphDivId, xData, yData, totalEntries, items, indicators, xLabel, yLabel, title) {
    $(graphDivId).html('');
    const radius = 8;
    let width = $(graphDivId).width() - 2 * margin;

    const svg = d3.select(graphDivId)
        .append("svg")
        .attr("width", width + 1.2 * margin)
        .attr("height", height + 2 * margin);

    const graph = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scalePoint()
        .range([0, width])
        .domain(xData)
        .padding(0.4);

    allYData = [];

    yData.forEach(ind => {
        ind.forEach(val => {
            allYData.push(val);
        });
    });

    var yExtent = d3.extent(allYData);

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yExtent[1]]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale);

    graph.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    graph.append('g')
        .call(d3.axisLeft(yScale));


    for (var ind = 0; ind < yData.length; ind++) {

        var circles = graph.selectAll()
            .data(yData[ind])
            .enter()
            .append('g');

        circles.append('circle')
            .attr('cx', (d, month) => xScale(xData[month]))
            .attr('cy', (d) => yScale(d))
            .attr('r', radius)
            .attr('ind', ind) // just to store ind value
            .attr('fill', indicators[ind]['color'])
            .style("stroke", "black")
            .style("stroke-width", 0)
            .style("cursor", "pointer")
            .on('mouseenter', function (actual, month, c) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.6)
                    .attr('r', radius * 1.3);

                circles.append('text')
                    .attr('class', 'circleValue')
                    .attr('x', xScale(xData[month]) + radius)
                    .attr('y', yScale(actual) - radius)
                    .text(actual)
                    .style("font-size", "14px")
                    .style("font-weight", "bold")
                    .attr("fill", "black");

                var ind = c[month].getAttribute("ind");

                circles.append('text')
                    .attr('class', 'circleValue')
                    .attr('x', xScale(xData[month]) + radius)
                    .attr('y', yScale(actual) - radius - 15)
                    .text(indicators[ind]['name'])
                    .style("font-size", "14px")
                    .style("font-weight", "bold")
                    .attr("fill", indicators[ind]['color']);
            })
            .on('mouseleave', function (actual, month) {
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .attr('r', radius);
                circles.selectAll('.circleValue').remove();
            })
            .on('click', function (actual, month, c) {
                if (actual > 0) {
                    // get indicator index from circle attribute, because ind var not available at click time
                    var ind = c[month].getAttribute("ind");
                    $('#studentsTable').html('');
                    $('#loading_table').show();
                    graph.selectAll("circle").attr('r', radius).style("stroke-width", 0);
                    d3.select(this).attr('r', radius * 1.5).style("stroke-width", 4);
                    setTimeout(function () {
                        tabulate(items[ind][month], cols);
                        $('#loading_table').hide();
                    }, 500);
                }
            });

        var line = d3.line()
            .x(function (d, i) { return xScale(xData[i]) })
            .y(function (d) { return yScale(d) });

        graph.append('path')
            .attr('d', line(yData[ind]))
            .attr('stroke', indicators[ind]['color']);
    }

    graph.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
            .tickSize(-width, 0, 0)
            .tickFormat(''));

    svg.append("text")
        .text(xLabel)
        .attr("x", width / 2 + margin)
        .attr("y", height + 1.7 * margin)
        .attr("text-anchor", "middle")
        .attr("fill", "black");

    svg.append("text")
        .text(yLabel)
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.8)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr("fill", "black");

    svg.append("text")
        .text(title)
        .attr("x", width / 2 + margin)
        .attr("y", margin * 0.3)
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .attr("text-anchor", "middle");

}


function lpad(string, padding, amount) {
    return (('' + padding).repeat(amount) + string).substr(-amount, amount)
}

function getLastDayOfMonth(date) {
    let day = new Date(date);
    return new Date(day.getFullYear(), day.getMonth() + 1, 0);
}

function getNextMonth(date) {
    return new Date(date.getFullYear() + (date.getMonth() === 11 ? 1 : 0), (date.getMonth() + 1) % 12, 1);
}

function getFileNames(type, start, end) {
    let files = [];
    start = getLastDayOfMonth(start);
    end = getLastDayOfMonth(end);
    while (start <= end) {
        files.push(type + '/FICA_' + start.getFullYear() + lpad(start.getMonth() + 1, 0, 2) + start.getDate());
        start = new getLastDayOfMonth(getNextMonth(start));
    }
    return files;
}

