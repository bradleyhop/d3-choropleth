<script>
import * as d3 from 'd3';
// import * as topology from 'topojson';

export default {
  name: 'Choropleth',

  data() {
    return {
      urlEdu:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',
      eduData: undefined, // placeholer for fetch'd eduacation data
      urlCounty:
      'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
      countyData: undefined, // placeholder for fetch'd county map data
      heightChart: 1000, // height of d3 svg elemennt
      widthChart: 1000, // width of d3 svg elemennt
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
        this.eduData = data;
      })
      // call function that will draw the graph
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    graphInit() {
      console.log(this.eduData[1]);

      // placeholder for graph drawing

      const svg = d3.select('#choropleth')
        .append('svg')
        .attr('height', this.heightChart)
        .attr('width', this.widthChart);

      // d3 projection
      const projection = d3.geoAlbersUsa()
        .translate([this.widthChart / 2], [this.heightChart / 2])
        .scale([100]);

      const path = d3.geoPath()
        .projection(projection);

      svg.selectAll(path)
        .append(path)
        .style('stroke', '#000')
        .style('stroke-width', '1');
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
