function createBarChart(chartDivId, xData, yData, totalEntries, items, xLabel, yLabel, title) {

    const svg = d3.select(chartDivId)
        .append("svg")
        .attr("width", width + 1.2 * margin)
        .attr("height", height + 2 * margin);

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
            // console.log(i);
            // console.log(actual);
            if (actual > 0) {
                // var cols = Object.keys(items[i][0]);
                // console.log(cols);
                var cols = ["Numero", "Nome", "CursoNome", "AnoLetivoMatricula", "EstadoMatricula"];
                tabulate(items[i], cols);
            }

        });

    bars.append('text')
        .attr('class', 'value')
        .attr('x', (d, i) => xScale(xData[i]) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d) - 8)
        .attr('text-anchor', 'middle')
        .text((d) => `${(d / totalEntries * 100).toFixed(1)}%`)
        .attr("fill", "black");

    chart.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft()
            .scale(yScale)
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
        .attr("y", margin * 0.75)
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

        return table;
    }

}