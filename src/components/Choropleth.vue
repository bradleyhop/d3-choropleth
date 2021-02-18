<script>
import * as d3 from 'd3';
// import * as topology from 'topojson';

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
        this.fetchData = data;
      })
      .then(() => {
        // merge the two data sets by county: "fips" and "id" are the same code!
        const mergeById = (arr1, arr2) => arr1.map((firstKey) => (
          {
            ...arr2.find((secondKey) => (firstKey.fips === secondKey.id) && secondKey), ...firstKey,
          }));
        this.stitchData = mergeById(this.fetchData[0],
          this.fetchData[1].objects.counties.geometries);
      })
      // call function that will draw the graph
      .then(() => this.graphInit())
      .catch((error) => console.log(error));
  },

  methods: {
    graphInit() {
      // note the length of all arrays is equal!
      console.log(this.fetchData[1].objects.counties.geometries);
      console.log(this.fetchData[0]);
      console.log(this.stitchData);

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
