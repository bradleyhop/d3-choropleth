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
      fetchData: undefined,
      // placeholder for a single array of objects combined by "fips" value given by the
      //  education json and the "id" given by the county json
      stitchData: undefined,
      heightChart: 800, // height of d3 svg elemennt
      widthChart: 1200, // width of d3 svg elemennt
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
        this.fetchData = data;
      })
      .then(() => {
        // NOTE: I don't think this is the way to merge the data! Too much is lost (see state lines
        // below).

        // merge the two data sets by county: "fips" and "id" refer to the same code!
        const mergeByIdFips = (arr1, arr2) => arr1.map((firstObj) => ({
          // using .find() because we are assuming that there are distinct "fips" and "id" values in
          //  each array of the objects
          ...arr2.find((secondObj) => (firstObj.fips === secondObj.id) && secondObj), ...firstObj,
        }));
        this.stitchData = mergeByIdFips(this.fetchData[0],
          this.fetchData[1].objects.counties.geometries);
      })
      // call function that will draw the graph
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    graphInit() {
      // based on: https://observablehq.com/@d3/choropleth

      console.log(this.fetchData[1].objects.counties);
      console.log(this.stitchData);

      const svg = d3.select('#choropleth')
        .append('svg')
        .attr('height', this.heightChart)
        .attr('width', this.widthChart);

      const path = d3.geoPath();

      // COUNTY svg and education data
      svg.append('g')
        .selectAll('path')
        .data(topojson.feature(this.fetchData[1], this.fetchData[1].objects.counties).features)
        .enter()
        .append('path')
        .attr('d', path);

      // STATE svg data
      svg.append('path')
        .datum(topojson.mesh(this.fetchData[1], this.fetchData[1].objects.states,
          (a, b) => a !== b))
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-linejoin', 'round')
        .attr('d', path);
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
