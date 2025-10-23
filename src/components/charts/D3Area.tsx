import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';

export interface AreaPoint {
  x: string | Date;
  y: number;
}

interface D3AreaProps {
  data: AreaPoint[];
  height?: number;
  color?: string;
  className?: string;
}

const D3Area: React.FC<D3AreaProps> = ({ data, height = 280, color = '#0d9488', className }) => {
  const ref = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const parsed = useMemo(() => {
    const parseTime = (v: string | Date) => (v instanceof Date ? v : new Date(v));
    return data
      .map(d => ({ date: parseTime(d.x), value: d.y }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data]);

  useEffect(() => {
    if (!ref.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select<SVGSVGElement, unknown>(ref.current);

    const render = () => {
      const width = container.clientWidth;
      svg.attr('width', width).attr('height', height);
      svg.selectAll('*').remove();

      const margin = { top: 12, right: 12, bottom: 60, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const x = d3
        .scaleUtc()
        .domain(d3.extent(parsed, (d: { date: Date }) => d.date) as [Date, Date])
        .range([0, innerWidth]);

      const y = d3
        .scaleLinear()
        .domain([0, (d3.max(parsed, (d: { value: number }) => d.value) || 0) * 1.1])
        .nice()
        .range([innerHeight, 0]);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const gradientId = 'areaGradient';
      const defs = svg.append('defs');
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0')
        .attr('x2', '0')
        .attr('y1', '0')
        .attr('y2', '1');
      gradient.append('stop').attr('offset', '10%').attr('stop-color', color).attr('stop-opacity', 0.35);
      gradient.append('stop').attr('offset', '95%').attr('stop-color', color).attr('stop-opacity', 0);

      const area = d3
        .area<{ date: Date; value: number }>()
        .x((d: { date: Date }) => x(d.date))
        .y0(innerHeight)
        .y1((d: { value: number }) => y(d.value))
        .curve(d3.curveMonotoneX);

      const line = d3
        .line<{ date: Date; value: number }>()
        .x((d: { date: Date }) => x(d.date))
        .y((d: { value: number }) => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path').datum(parsed).attr('fill', `url(#${gradientId})`).attr('d', area as any);
      g.append('path').datum(parsed).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('d', line as any);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(width < 500 ? 4 : 8).tickSizeOuter(0))
        .selectAll('text')
        .attr('fill', '#6b7280')
        .style('font-size', '12px')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '0.15em')
        .attr('transform', 'rotate(-45)');

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickSizeOuter(0))
        .selectAll('text')
        .attr('fill', '#6b7280')
        .style('font-size', '12px');
    };

    render();

    const ro = new ResizeObserver(render);
    ro.observe(container);
    return () => ro.disconnect();
  }, [parsed, height, color]);

  return (
    <div ref={containerRef} className={className}>
      <svg ref={ref} />
    </div>
  );
};

export default D3Area;