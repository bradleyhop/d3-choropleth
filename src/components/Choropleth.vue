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
      heightChart: 800, // height of d3 svg elemennt
      widthChart: 1200, // width of d3 svg elemennt
      mapPosition: '150, 40', // position of BOTH state and county maps within the svg
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

      const svg = d3.select('#choropleth')
        .append('svg')
        .attr('height', this.heightChart)
        .attr('width', this.widthChart);

      // creates a linear color scale for us! thanks d3!
      const colorScale = d3.scaleLinear()
        .domain([
          d3.min(this.eduData, (d) => d.bachelorsOrHigher),
          d3.max(this.eduData, (d) => d.bachelorsOrHigher),
        ])
        .range(['#ffffff', '#004D40']);

      const path = d3.geoPath(); // provides backbone for svg data

      // COUNTY svg and education data
      svg.append('g')
        .selectAll('path')
        // converts the TopoJSON data that we get into GeoJSON that D3's .geoPath() can use
        .data(topojson.feature(this.countyData, this.countyData.objects.counties).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'county') // project requirement
        .attr('data-fips', (d) => d.id) // project requirement
        .attr('data-education', (d) => d.properties.bachelorsOrHigher) // project requirement
        .attr('fill', (d) => colorScale(d.properties.bachelorsOrHigher))
        // .attr('data', (d) => JSON.stringify(d)) // what are we working with?!
        .attr('transform', `translate(${this.mapPosition})`);

      // STATE svg data; drawn on top of county data
      svg.append('path')
        .datum(topojson.mesh(this.countyData, this.countyData.objects.states,
          (a, b) => a !== b))
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-linejoin', 'round')
        .attr('d', path)
        .attr('transform', `translate(${this.mapPosition})`);
    },

    // Takes in the minimum and maximum of a range of numbers; count is the number of steps between
    //  each value; returns an array with length of count starting with the min and ending with the
    //  max.
    stepScaleArr(min, max, count) {
      const arr = [];
      const step = (max - min) / count;
      const base = min;
      for (let i = 1; i < count + 1; i += 1) {
        arr.push(d3.format('0.2f')(base + i * step));
      }
      return arr;
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
</style>
