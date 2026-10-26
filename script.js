function toMinutes(runtime) {
  const [hours, minutes] = runtime.split(":").map(Number);
  return hours * 60 + minutes;
}

d3.csv("netflix.csv", d => ({
  title: d.title,
  runtime: toMinutes(d.runtime),
  hours: +d.hours_viewed,
  views: +d.views
})).then(movies => {

  const clean = movies.filter(d =>
    Number.isFinite(d.runtime) &&
    d.runtime > 0 &&
    Number.isFinite(d.hours) &&
    Number.isFinite(d.views)
  );

  console.log("Movies loaded:", clean.length);
  console.table(clean.slice(0, 10));
  
const bins = d3.bin()
  .value(d => d.runtime)
  .domain([0, d3.max(clean, d => d.runtime) + 1])
  .thresholds([90, 120, 150])(clean);

console.log("Runtime groups:", bins);


const labels = ["Under 90", "90–119", "120–149", "150+"];

const summary = bins.map((bin, i) => ({
  runtime: labels[i],
  avgHours: d3.mean(bin, d => d.hours),
  avgViews: d3.mean(bin, d => d.views),
  count: bin.length
}));

console.table(summary);


console.table(summary);


function drawChart(container, metric, label, color) {
  const width = 800;
  const height = 450;
  const margin = { top: 30, right: 30, bottom: 60, left: 100 };

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const x = d3.scaleBand()
    .domain(summary.map(d => d.runtime))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(summary, d => d[metric])])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.selectAll("rect")
    .data(summary)
    .join("rect")
    .attr("x", d => x(d.runtime))
    .attr("y", d => y(d[metric]))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d[metric]))
    .attr("fill", color);

svg.selectAll(".count-label")
  .data(summary)
  .join("text")
  .attr("class", "count-label")
  .attr("x", d => x(d.runtime) + x.bandwidth() / 2)
  .attr("y", d => y(d[metric]) - 10)
  .attr("text-anchor", "middle")
  .text(d => `${d.count.toLocaleString()} movies`);

  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .text("Movie runtime (minutes)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .text(label);
}

drawChart("#hours-chart", "avgHours", "Average hours viewed", "#E50914");
drawChart("#views-chart", "avgViews", "Average views", "#397FA3");

}).catch(console.error);
