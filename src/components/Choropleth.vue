<script>
// import * as d3 from 'd3';
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
    fetch(this.urlCounty)
      .then((response) => response.json())
      .then((data) => {
        this.eduData = data;
        // map data from edu into counties here?
      })
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    graphInit() {
      console.log(this.eduData);

      /*
       *       const svg = d3.select('#choropleth')
       *         .append('svg')
       *         .attr('height', this.heightChart)
       *         .attr('width', this.widthChart);
       *
       *       // d3 projection
       *       const projection = d3.geo.albersUsa()
       *         .translate([this.widthChart / 2], [this.heightChart / 2])
       *         .scale([1000]);
       *
       *       const path = d3.geo.path()
       *         .projection(projection);
       *
       *       svg.selectAll('path')
       *         .append('path')
       *         .style('stroke', '#fff')
       *         .style('stroke-width', '1');
       */
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
