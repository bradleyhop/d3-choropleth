<script>
import * as d3 from 'd3';
import * as topojson from 'topojson';

export default {
  name: 'Choropleth',

  data() {
    return {
      // url returns json data with education level attainment by county
      urlEdu:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
      // url returnds json needed to draw counties needed by topojson and d3
      urlCounty:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
      // placeholer for fetch'd eduacation and count data stored in an array for each fetch'd json
      //  education json and the "id" given by the county json
      fetchData: undefined,
      stitchData: undefined,
      eduData: undefined, // placeholer for education attainment by county data
      countyData: undefined, // TopoJSON data for drawing counties, states
      heightChart: '650', // height of d3 svg elemennt
      widthChart: '1200', // width of d3 svg elemennt
      mapPosition: '150, 40', // position of BOTH state and county maps within the svg
      legendWidth: 180,
      legendPostion: '800, 80',
      // 7 count divergent color swatch for temp colors:
      // Sequential color scheme started as YlGnBl from https://observablehq.com/@d3/color-schemes
      // Colors converted to nearest material design palate using https://materialmixer.co/
      colorBand: ['#fff9c4', '#c5e1a5', '#80cbc4', '#4db6ac', '#1976d2', '#1565c0', '#1a237e'],
    };
  },

  created() {
    // fetch both sets of data simultaneously and combine into one data
    Promise.all([
      fetch(this.urlEdu),
      fetch(this.urlCounty),
    ])
      .then((responses) => Promise.all(responses.map((response) => response.json())))
      .then((data) => {
        this.eduData = data[0];
        this.countyData = data[1];
        this.fetchData = data;
      })
      .then(() => {
        // NOTE: This is slow?! At least the browser isn't complaining about a bad script...
        // merge the two data sets by county: "fips" and "id" refer to the same code!
        const mergeByIdFips = (arr1, arr2) => arr1.map((firstObj) => ({
          // using .find() because we are assuming that there are distinct "fips" and "id" values in
          //  each array of the objects
          ...arr2.find((secondObj) => (firstObj.fips === secondObj.id) && secondObj), ...firstObj,
        }));
        this.stitchData = mergeByIdFips(this.eduData,
          this.countyData.objects.counties.geometries);
      })
      // This inserts the education data into county svg data so that we need only reference one
      // object instead of constantly searching between the two.
      .then(() => {
        this.countyData.objects.counties.geometries = this.stitchData.map((d) => ({
          ...d,
          properties: {
            fips: d.fips,
            area_name: d.area_name,
            state: d.state,
            bachelorsOrHigher: d.bachelorsOrHigher,
          },
        }));
      })
      // call function that will draw the graph
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    graphInit() {
      // based on: https://observablehq.com/@d3/choropleth

      console.log(this.eduData);
      console.log(this.countyData);
      console.log(this.stitchData);

      const lowestLevelEdu = d3.min(this.eduData, (d) => d.bachelorsOrHigher);
      const highestLevelEdu = d3.max(this.eduData, (d) => d.bachelorsOrHigher);

      console.log(`Min: ${lowestLevelEdu}, Max: ${highestLevelEdu}`);

      const svg = d3.select('#choropleth')
        .append('svg')
        .attr('height', this.heightChart)
        .attr('width', this.widthChart);

      // creates a linear color scale for us! thanks d3!
      const colorScale = d3.scaleQuantize()
        .domain([
          lowestLevelEdu,
          highestLevelEdu,
        ])
        .range(this.colorBand);

      console.log(colorScale(22.5));

      // svg group for the mapping of data; helps keep data graphics separate from axis
      const map = svg.append('g')
        .attr('id', 'map')
        .attr('class', 'map');

      // function declaration for tooltip div element
      const divTool = d3.select('#choropleth')
        .append('g')
        .attr('id', 'tooltip') // project requirement
        .attr('class', 'tooltip')
        .style('opacity', 0);

      // COUNTY svg and education data
      map.selectAll('path')
        // converts the TopoJSON data that we get into GeoJSON that D3's .geoPath() can use
        .data(topojson.feature(this.countyData, this.countyData.objects.counties).features)
        .enter()
        .append('path')
        .attr('d', d3.geoPath()) // provides backbone for svg data
        // .attr('data', (d) => JSON.stringify(d)) // what are we working with?!
        .attr('class', 'county') // project requirement
        .attr('data-fips', (d) => d.id) // project requirement
        .attr('data-education', (d) => {
          if (d.properties.bachelorsOrHigher) {
            return d.properties.bachelorsOrHigher;
          }
          return 'Edcuation Data Not Available';
        }) // project requirement
        .attr('fill', (d) => {
          if (d.properties.bachelorsOrHigher) {
            return colorScale(d.properties.bachelorsOrHigher);
          }
          return '#000';
        })
        // hover over county to show tooltip info
        .on('mouseover', (event, d) => {
          divTool
            .style('opacity', 1)
            .style('display', 'flex')
            .attr('data-education', d.properties.bachelorsOrHigher) // project requirement
            .html(`<p>
              <span>${d.properties.area_name}, ${d.properties.state}:
              ${d.properties.bachelorsOrHigher}&#37;</span>
            </p>`)
            // offsets for tooltip box
            .style('top', '15%')
            .style('left', '40%');
        })
        .on('mouseout', () => {
          divTool
            .style('opacity', 0)
            .style('display', 'none');
        })
        .attr('transform', `translate(${this.mapPosition})`);

      // STATE svg data; drawn on top of county data
      svg.append('path')
        .datum(topojson.mesh(this.countyData, this.countyData.objects.states,
          (a, b) => a !== b))
        .attr('d', d3.geoPath())
        .attr('class', 'state') // color fill and outline change in css on hover
        .attr('fill', 'none')
        .attr('stroke-linejoin', 'round')
        .attr('transform', `translate(${this.mapPosition})`);

      // LEGEND
      const legend = svg.append('g')
        .attr('id', 'legend'); // project requirement

      const legendScale = d3.scaleLinear()
        .domain([
          lowestLevelEdu,
          highestLevelEdu,
        ])
        .range([
          0,
          this.legendWidth,
        ]);

      const legendAxis = d3.axisBottom(legendScale)
        .tickSize(30);

      legend
        .attr('transform', `translate(${this.legendPostion})`)
        .call(legendAxis);

      legend.selectAll('rect')
      // see for explanation:
      //  https://stackoverflow.com/questions/48161257/understanding-invertextent-in-a-threshold-scale
        .data(colorScale.range().map((color) => {
          const d = colorScale.invertExtent(color);
          // to set lowest range
          if (d[0] === undefined) d[0] = lowestLevelEdu;
          // to set highest range
          if (d[1] === undefined) d[1] = highestLevelEdu;
          return d;
        }))
        .enter()
        .append('rect')
        .attr('class', 'legend-cell')
        .attr('x', (d) => legendScale(d[0]))
        .attr('width', (d) => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', 20)
        // deviating from example because this works
        .attr('fill', (d, i) => this.colorBand[i]);
    },
  },
};
</script>

<template>
  <div class="conainter-choropleth">
    <h2
      class="chart-title"
      id="description">
      Percentage of Adults Age 25 and Older With a Bachelor's Degree or Higher (2010-2014)
    </h2>
    <!-- d3 choropleth map is drawn at #choropleth -->
    <div
      class="choropleth"
      id="choropleth"
    >
    </div>
  </div>
</template>

<style lang="scss">
.chart-title {
  color: $text-gray;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  margin-bottom: 0;
}

.choropleth {
  overflow: hidden;
}

.county:hover {
  fill: #fff;
  stroke: #616161;
}

.state {
  stroke: $app-background;
}

.tooltip {
  align-items: center;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 24px;
  position: absolute;
}
</style>
