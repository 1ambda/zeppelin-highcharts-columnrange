import Visualization from 'zeppelin-vis'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'

import Highcharts from 'highcharts/highcharts'
require('highcharts/highcharts-more.js')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)

export default class ColumnRangeChart extends Visualization {
    constructor(targetEl, config) {
        super(targetEl, config)

        this.columnSelectorProps = [
            { name: 'xAxis', },
            { name: 'yAxis', },
        ]

        this.transformation = new ColumnselectorTransformation(
            config, this.columnSelectorProps)
    }

    /**
     * @param tableData {Object} includes cols and rows. For example,
     *                           `{columns: Array[2], rows: Array[11], comment: ""}`
     *
     * Each column includes `aggr`, `index`, `name` fields.
     *  For example, `{ aggr: "sum", index: 0, name: "age"}`
     *
     * Each row is an array including values.
     *  For example, `["19", "4"]`
     */
    render(tableData) {
        const conf = this.config

        /** column range chart can be rendered when all 2 axises are defined */
        if (!conf.xAxis || !conf.yAxis) {
            return
        }

        const rows = tableData.rows

        const [xAxisIndex, xAxisName] = [conf.xAxis.index, conf.xAxis.name]
        const [yAxisIndex, yAxisName] = [conf.yAxis.index, conf.yAxis.name]

        const { yAxisCategories, } = extractCategories(yAxisIndex, rows)
        const data = createDataStructure(xAxisIndex, yAxisIndex, yAxisCategories, rows)

        const chartOption = createHighchartOption(xAxisName, yAxisName, yAxisCategories, data);
        Highcharts.chart(this.targetEl[0].id, chartOption);
    }

    getTransformation() {
        return this.transformation
    }
}

/**
 * create yAxisCategories required by column range chart
 *
 * @return {Object} which including
 * - `yAxisCategories` {Array}
 *
 * See also: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/columnrange/
 */
export function extractCategories(yAxisIdx, rows) {
    const yAxisCategories = {};

    for(let i = 0; i < rows.length; i++) {
        const row = rows[i];

        const yAxisCategory = row[yAxisIdx]
        if (!yAxisCategories[yAxisCategories]) {
            yAxisCategories[yAxisCategory] = true;
        }
    }

    return {
        yAxisCategories: Object.keys(yAxisCategories),
    }
}

/**
 * Column range requires array of `[min, max]` for xAxis (inverted)
 *
 * @return {Array<Array<number>>}
 *
 * See also: http://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/columnrange/
 */
export function createDataStructure(xAxisIndex, yAxisIndex,
                                    yAxisCategories, rows) {
    const categorized = yAxisCategories.map(() => []);
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // get category index
        const yAxisValue = row[yAxisIndex]
        const yAxisValueIndex = yAxisCategories.indexOf(yAxisValue)

        // push xAxisValue into proper the yAxis category
        const xAxisValue = parseFloat(row[xAxisIndex])
        categorized[yAxisValueIndex].push(xAxisValue)
    }

    // TODO:
    // we can remove this logic (optimization)
    // since we can get min and max while iterating in the for loop above
    const calculated = categorized.map(arr => {
        const min = Math.min(...arr)
        const max = Math.max(...arr)
        return [min, max]
    })

    return calculated
}

export function createHighchartOption(xAxisName, yAxisName, yAxisCategories, data) {
    return {

        chart: { type: 'columnrange', inverted: true },
        title: { text: '' },

        xAxis: {
            categories: yAxisCategories, /** inverted */
            title: { text: yAxisName, /** inverted */ },
        },
        yAxis: {
            title: { text: xAxisName /** inverted */ },
        },

        plotOptions: {
            columnrange: {
                dataLabels: {
                    enabled: true,
                    formatter: function () { return this.y }
                }
            }
        },

        legend: { enabled: false },

        series: [{
            name: xAxisName,
            data: data,
        }]
    }
}
