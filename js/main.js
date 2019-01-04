function createBarChart(chartDivId, xData, yData, totalEntries, items, xLabel, yLabel, title) {

    var cols = ["Numero", "Nome", "CursoNome", "AnoLetivoMatricula", "EstadoMatricula", "AnoCurricular",
        "IND2_1", "ECTS_InscritosAnoAtual", "ECTS_InscritoAnoAtualSemestre1", "ECTS_FeitosAnoAtual",
        "IND2_2", "Propina_TotalEmDivida",
        "IND2_3", "BolsaSAS_EstadoBolsa",
        "IND2_4", "IngressoRG_nota",
        "IND2_5", "NumUCinscritas", "UC1_Assiduidade", "UC2_Assiduidade", "UC3_Assiduidade", "UC4_Assiduidade", "UC5_Assiduidade"];

    const svg = d3.select(chartDivId)
        .append("svg")
        .attr("width", width + 1.2 * margin)
        .attr("height", height + 2 * margin)
    // .style("border-style", "dotted");

    const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(xData)
        .padding(0.4)

    var yExtent = d3.extent(yData, function (d) { return d });

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, yExtent[1]]);

    const makeYLines = () => d3.axisLeft()
        .scale(yScale)

    chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    const bars = chart.selectAll()
        .data(yData)
        .enter()
        .append('g');

    bars.append('rect')
        .attr('x', (d, i) => xScale(xData[i]))
        .attr('y', (d) => yScale(d))
        .attr('height', (d) => height - yScale(d))
        .attr('width', xScale.bandwidth())
        .on('mouseenter', function (actual, i) {

            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', 0.6)
                .attr('x', xScale(xData[i]) - 5)
                .attr('width', xScale.bandwidth() + 10)

            // d3.select(this).attr('opacity', 0.8)
        })
        .on('mouseleave', function (actual, i) {
            d3.select(this)
                .transition()
                .duration(300)
                .attr('opacity', 1)
                .attr('x', xScale(xData[i]))
                .attr('width', xScale.bandwidth())
        })
        .on('click', function (actual, i) {

            if (actual > 0) {
                tabulate(items[i], cols);
            }

        });

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
        .text((d) => `(${(d / totalEntries * 100).toFixed(1)}%)`)
        .style("font-size", "12px")
        .attr("fill", "black");

    chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
            .tickSize(-width, 0, 0)
            .tickFormat(''));

    svg.append("text")
        .text("Número total de alunos: " + totalEntries)
        .attr('x', margin * 0.2)
        .attr('y', margin * 0.25)
        .attr("fill", "black");

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

