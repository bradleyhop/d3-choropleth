# d3-choropleth

Data Visualization Project for freeCodeCamp.org Data Visualization Project: Visualize Data with a
Choropleth Map. This implementation uses Vue & D3 as the main technology stacks.

## Project Info

See the [User
Stories](https://www.freecodecamp.org/learn/data-visualization/data-visualization-projects/visualize-data-with-a-choropleth-map)
for project requirements.

## Integrated Testing Suite

freeCodeCamp.org offers a script that will test each User Story point. To test, select the testing
component (the green three-line-hamburger icon in the upper left corner), choose 'D3 Choropleth Map'
from the drop-down menu, and hit 'Run Tests'. Select the 'Tests' button after the script is finished
to see details of test.

## Take-Aways

This was definitely challenging. Digging around on the freeCodeCamp forums is required for getting
anywhere on this project. After reading through a few articles, it seems this project was based
around [this example](https://observablehq.com/@d3/choropleth) and so offered some direction as
well.

### TopoJSON

[TopoJSON](https://github.com/topojson/topojson) is an extension of GeoJSON that encodes topology
that reduces file size by removing redundant, overlapping boundaries. The data from the freeCodeCamp
provided API has no identifying information that the data is in TopoJSON format; only the key value
pair: `Type: Topology`. However, after digging through the forums and reading how to implement and
understand what TopoJSON is doing, I am able to draw the map with SVG.

I chose to combine the education and topology data to reduce redundant searches, and streamline the
drawing and assigning attributes to each county as its being drawn by D3. I tried just adding the
values of the education object by `fips` to the svg data by `id`; however, the TopoJSON method
needed to feed D3 the data it needs strips any extraneous object data that isn't topology svg data
-- with one exception: there is a `properties: {}` key:value pair that can be filled prior to
passing it to the TopoJSOn method and will be preserved as the map is being drawn. The solution was
to merge the two data sets by inputting the eduction data into the matching county data `properties`
object. Once the data was merged, the rest of this project mirrored much of the previous
freeCodeCamp D3 projects with assigning attributes, mouseover tooltips, etc.

### SVG viewBox()

This was the first freeCodeCamp D3 project where I thought responsiveness would be nice. I hadn't
seen the need for responsiveness with the previous D3 projects since the datasets, and therefore the
charts, were quite large. Plus, it wasn't a requirement and wasn't demonstrated in the demos.
However, with this project, I really wanted to see this map on my phone even though the counties may
be tiny.

SVG does not scale like images do. The map draws at a fixed size, but I struggled with getting to
scale. This article on [SVG viewport and
viewbox](https://webdesign.tutsplus.com/tutorials/svg-viewport-and-viewbox-for-beginners--cms-30844)
clarified how to scale and position svg elements. I set the last two parameters the `viewBox()`
attribute for the SVG element area to the example listed in the article above to zoom the image. I
choose to set the SVG parent element's `width` in CSS to a certain percentage allowing the map to
shrink and grow to the page size. For positioning, I choose `transform: translate()` since there are
three components of the map that are drawn in the SVG element area: county and state lines together,
and the legend.

## Final Thoughts

The more of these D3 freeCodeCamp projects, the more I see the value in modularity and reusability
of code. It seems I copied half the code from the last project into this one. I only needed to
modify a few variables and parameters specific to this project. Also, D3 is not verbose in it's
error handling, which makes debugging and trouble-shooting very annoying. Vue, however, is amazing
in providing feedback on build, code linting, and runtime errors and so will continue to develop
using this framework.
