<script>
import * as d3 from 'd3';
import * as topojson from 'topojson';

export default {
  name: 'Choropleth',

  data() {
    return {
      loading: true, // conditional redning variable to show basic loading status to user
    };
  },

  created() {
    // fetch both sets of data asynchronously and combine into one data set
    Promise.all([
      // url returns json data with education level attainment by county
      fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'),
      // url returns json needed to draw counties needed by topojson and d3
      fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'),
    ])
      // the fetch'd data is combined into an array with data[0] representing the education data
      //  and data[1] representing the path data for the counties and state
      .then((responses) => Promise.all(responses.map((response) => response.json())))
      .then((data) => {
        this.eduData = data[0];
        this.mapData = data[1];
      })
      .then(() => {
        // NOTE: This is slow?! At least the browser isn't complaining about a bad script anymore...
        // merge the two data sets by county: "fips" in education data and "id" in the counties
        //  data refer to the same code!
        const mergeByIdFips = (arr1, arr2) => arr1.map((firstObj) => ({
          // using .find() because we are assuming that there are distinct "fips" and "id" values in
          //  each array of the objects
          ...arr2.find((secondObj) => (firstObj.fips === secondObj.id)), ...firstObj,
        }));
        this.stitchData = mergeByIdFips(this.eduData,
          this.mapData.objects.counties.geometries);
      })
      // This inserts the education data into county svg data so that we need only reference one
      // object instead of constantly searching between the two when renedering the map.
      .then(() => {
        this.mapData.objects.counties.geometries = this.stitchData.map((d) => ({
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

      const heightChart = '650'; // height of d3 svg #choropleth element
      const widthChart = '1200'; // width of d3 svg #choropleth element
      const mapViewBox = '0 0 975 610'; // position of BOTH state and county maps within the svg
      const legendWidth = 250;
      const legendPostion = '600, 35';
      // 7 count divergent color swatch for temp colors:
      // Sequential color scheme started as YlGnBl from https://observablehq.com/@d3/color-schemes
      // Colors converted to nearest material design palate using https://materialmixer.co/
      const colorBand = ['#fff9c4', '#c5e1a5', '#80cbc4', '#4db6ac', '#1976d2', '#1565c0', '#1a237e'];

      // remove loading message
      this.loading = false;

      const lowestLevelEdu = d3.min(this.eduData, (d) => d.bachelorsOrHigher);
      const highestLevelEdu = d3.max(this.eduData, (d) => d.bachelorsOrHigher);

      const svg = d3.select('#choropleth')
        .append('svg')
        .attr('viewBox', mapViewBox)
        .attr('height', heightChart)
        .attr('width', widthChart);

      const colorScale = d3.scaleThreshold()
        .domain(this.stepScaleArr(
          lowestLevelEdu,
          highestLevelEdu,
          colorBand.length,
        ))
        .range(colorBand);

      // svg group for the mapping of data; helps keep data graphics separate from axis
      const map = svg.append('g')
        .attr('id', 'map')
        .attr('class', 'map');

      // function declaration for tooltip div element
      const divTool = d3.select('#tooltip-container')
        .append('g')
        .attr('id', 'tooltip') // must be here to satisfy project requirement
        .style('visibility', 'hidden');

      // COUNTY svg and education data
      map.selectAll('path')
        // converts the TopoJSON data that we get into GeoJSON that D3's .geoPath() can use
        .data(topojson.feature(this.mapData, this.mapData.objects.counties).features)
        .enter()
        .append('path')
        .attr('d', d3.geoPath()) // provides backbone for svg data
        // .attr('data', (d) => JSON.stringify(d)) // what are we working with?!
        .attr('class', 'county') // project requirement
        .attr('data-fips', (d) => (d.id ? d.id : 0)) // project requirement
        .attr('data-education', (d) => (d.properties.bachelorsOrHigher ? d.properties.bachelorsOrHigher
          : 0)) // project requirement
        .attr('fill', (d) => (d.properties.bachelorsOrHigher
          ? colorScale(d.properties.bachelorsOrHigher) : '#000'))
        // hover over county to show tooltip info
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .on('mouseover', (event, d) => {
          divTool
            .style('visibility', 'visible')
            .attr('data-education', (d.properties.bachelorsOrHigher ? d.properties.bachelorsOrHigher
              : 0)) // project requirement
            .html(`<p>
              <span>
              ${d.properties.area_name ? d.properties.area_name : 'County Unknown'},
              ${d.properties.state ? d.properties.state : 'State Unkown'}:
              ${d.properties.bachelorsOrHigher
    ? d.properties.bachelorsOrHigher : 'Edcuation Data Not Available'}&#37;
              </span>
            </p>`);
        })
        .on('mouseout', () => {
          divTool
            .style('visibility', 'hidden');
        });

      // STATE svg data; drawn on top of county data
      svg.append('path')
        .datum(topojson.mesh(this.mapData, this.mapData.objects.states,
          (a, b) => a !== b))
        .attr('d', d3.geoPath())
        .attr('class', 'state') // color fill and outline change in css on hover in css
        .attr('fill', 'none')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round');

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
          legendWidth,
        ]);

      const legendAxis = d3.axisBottom(legendScale)
        // add lowestLevelEdu to label range b/c not in domain
        .tickValues([lowestLevelEdu].concat(colorScale.domain()))
        .tickFormat((d) => `${d3.format('d')(d)}%`) // format to decimal, rounded to int
        .tickSize(20);

      legend
        .attr('transform', `translate(${legendPostion})`)
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
        .attr('height', 12)
        // deviating from example because this works
        .attr('fill', (d, i) => colorBand[i]);
    },

    // Takes in the minimum and maximum of a range of numbers; count is the number of steps between
    //  each value; returns an array with length of count starting with the min and ending with the
    //  max.
    stepScaleArr(min, max, count) {
      const arr = [];
      const step = (max - min) / count;
      const base = min;
      for (let i = 1; i < count + 1; i += 1) {
        arr.push(d3.format('0.1f')(base + i * step));
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
      id="description"
      >
      Percentage of Adults Age 25 and Older With a Bachelor's Degree or Higher
      (2010-2014)<sup>*</sup>
    </h2>
    <!-- tooltip info displays on mouseover here; id is project requirement -->
    <div
      id="tooltip-container"
      class="tooltip-container"
      >
      <!-- show message to user that data is processing; once data is merged,
        drawing the map is quick -->
      <p
        class="loading-message"
        v-if="this.loading">
      Loading...
      </p>
    </div>
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
  color: $text-default;
  font-family: Roboto, Helvetica, Arial, sans-serif;
  margin-bottom: 0;
}

.county:hover {
  fill: #fff;
  stroke: #616161;
}

.state {
  stroke: $app-background;
}

.tooltip-container {
  font-family: Roboto, Helvetica, Arial, sans-serif;
  font-size: 24px;
  font-weight: bold;
  height: 1.75rem;
  margin-top: 1.5rem;
}
</style>
