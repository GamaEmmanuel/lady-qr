import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

export interface DonutDatum {
  name: string;
  value: number;
}

interface D3DonutProps {
  data: DonutDatum[];
  colors?: string[];
  height?: number;
  className?: string;
}

const defaultColors = ['#0d9488', '#f97316', '#3b82f6', '#ef4444', '#8b5cf6'];

const D3Donut: React.FC<D3DonutProps> = ({ data, colors = defaultColors, height = 300, className }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  useEffect(() => {
    if (!ref.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select<SVGSVGElement, unknown>(ref.current);

    const render = () => {
      const width = container.clientWidth;
      svg.attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      const radius = Math.min(width, height) / 2 - 10;
      const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

      const pie = d3.pie<DonutDatum>().value((d: DonutDatum) => d.value).sort(null);
      const arc = d3.arc<d3.PieArcDatum<DonutDatum>>().innerRadius(radius * 0.6).outerRadius(radius);

      const colorScale = d3
        .scaleOrdinal<string, string>()
        .domain(data.map((d: DonutDatum) => d.name))
        .range(colors);

      g
        .selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('fill', (d: d3.PieArcDatum<DonutDatum>) => colorScale(d.data.name))
        .attr('d', arc as any);

      // Add labels on each slice
      const labelArc = d3.arc<d3.PieArcDatum<DonutDatum>>()
        .innerRadius(radius * 0.8)
        .outerRadius(radius * 0.8);

      g
        .selectAll('text.slice-label')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('class', 'slice-label')
        .attr('transform', (d: d3.PieArcDatum<DonutDatum>) => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', 14)
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text((d: d3.PieArcDatum<DonutDatum>) => d.data.value);

      g
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', 32)
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(total.toLocaleString());

      const legend = svg.append('g').attr('transform', `translate(12,12)`);
      const legendItem = legend
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', (_d: DonutDatum, i: number) => `translate(0, ${i * 20})`);
      legendItem
        .append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 2)
        .attr('fill', (d: DonutDatum) => colorScale(d.name));
      legendItem
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('font-size', 12)
        .attr('fill', '#374151')
        .text((d: DonutDatum) => `${d.name}`);
    };

    render();
    const ro = new ResizeObserver(render);
    ro.observe(container);
    return () => ro.disconnect();
  }, [data, colors, height]);

  return (
    <div ref={containerRef} className={className}>
      <svg ref={ref} />
    </div>
  );
};

export default D3Donut;