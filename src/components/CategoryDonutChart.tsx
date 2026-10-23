import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryBreakdownItem } from '../utils/calculations';
import { formatCurrency, formatCurrencyFlexible } from '../utils/formatters';

interface CategoryDonutChartProps {
  items: CategoryBreakdownItem[];
  total: number;
  centerLabel: string;
  activeCategoryId?: string | null;
  onHoverCategory?: (id: string | null) => void;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  items,
  total,
  centerLabel,
  activeCategoryId,
  onHoverCategory,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const formattedAmount = formatCurrencyFlexible(total);
  // Slightly adjust font size if the currency string is lengthy
  const amountFontSize = formattedAmount.length > 9 ? '11px' : formattedAmount.length > 7 ? '13px' : '14px';

  // Calculate stable position near the hovered segment that NEVER overlaps the chart center (y: 36-108) or legend
  const calculatePosition = (midAngle: number): { x: number; y: number } => {
    // Recharts midAngle: 0 = right (3 o'clock), 90 = top (12 o'clock), 180 = left (9 o'clock), 270 = bottom (6 o'clock)
    const normalizedAngle = ((midAngle % 360) + 360) % 360;
    const rad = (normalizedAngle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Vertical placement:
    // Upper hemisphere (sin >= 0): y = 0 (top periphery). Tooltip ends at y <= 36.
    // Lower hemisphere (sin < 0): y = 108 (bottom periphery). Tooltip starts at y >= 108.
    // Center core is strictly at y: 36 to 108, so tooltip NEVER covers the center core!
    const y = sin >= 0 ? 0 : 108;

    // Horizontal placement:
    // Left quadrant: x = 2
    // Center quadrant: x = 20
    // Right quadrant: x = 36
    // Tooltip width is ~105px. With x: 36, max right is 141px, staying inside chart box and not covering legend!
    const x = cos < -0.3 ? 2 : cos > 0.3 ? 36 : 20;

    return { x, y };
  };

  // Synchronize tooltip position when hovering category from the legend
  useEffect(() => {
    if (activeCategoryId) {
      const idx = items.findIndex((i) => i.categoryId === activeCategoryId);
      if (idx !== -1) {
        let cumulative = 0;
        for (let i = 0; i < idx; i++) cumulative += items[i].amount;
        cumulative += items[idx].amount / 2;
        const totalAmount = total || 1;
        const angle = 360 * (1 - cumulative / totalAmount);
        setTooltipPos(calculatePosition(angle));
      }
    } else if (!hoveredSlice) {
      setTooltipPos(null);
    }
  }, [activeCategoryId, hoveredSlice, items, total]);

  return (
    <div className="donut-chart-box">
      <div className="donut-graphic-wrapper">
        <ResponsiveContainer width={144} height={144}>
          <PieChart width={144} height={144}>
            <Pie
              data={items}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={items.length > 1 ? 2 : 0}
              stroke="#0b172a"
              strokeWidth={1.5}
              animationDuration={400}
              onMouseEnter={(data) => {
                const id = data?.payload?.categoryId || data?.categoryId || null;
                const angle =
                  typeof data?.midAngle === 'number'
                    ? data.midAngle
                    : typeof data?.payload?.midAngle === 'number'
                    ? data.payload.midAngle
                    : undefined;
                setHoveredSlice(id);
                if (typeof angle === 'number') {
                  setTooltipPos(calculatePosition(angle));
                }
                if (onHoverCategory) onHoverCategory(id);
              }}
              onMouseMove={(data) => {
                const angle =
                  typeof data?.midAngle === 'number'
                    ? data.midAngle
                    : typeof data?.payload?.midAngle === 'number'
                    ? data.payload.midAngle
                    : undefined;
                if (typeof angle === 'number') {
                  setTooltipPos(calculatePosition(angle));
                }
              }}
              onMouseLeave={() => {
                setHoveredSlice(null);
                setTooltipPos(null);
                if (onHoverCategory) onHoverCategory(null);
              }}
            >
              {items.map((entry) => {
                const isTarget =
                  (hoveredSlice && hoveredSlice === entry.categoryId) ||
                  (activeCategoryId && activeCategoryId === entry.categoryId);
                return (
                  <Cell
                    key={entry.categoryId}
                    fill={entry.color}
                    opacity={activeCategoryId && !isTarget ? 0.45 : 1}
                    style={{
                      filter: isTarget ? 'brightness(1.18) drop-shadow(0 0 6px rgba(116, 246, 200, 0.45))' : 'none',
                      transition: 'opacity 0.2s, filter 0.2s',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              position={tooltipPos ?? undefined}
              allowEscapeViewBox={{ x: true, y: true }}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 60 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as CategoryBreakdownItem;
                return (
                  <div className="donut-chart-tooltip">
                    <span className="donut-tooltip-label">{data.name}</span>
                    <div className="donut-tooltip-row">
                      <i style={{ background: data.color }} />
                      <strong>{formatCurrency(data.amount)}</strong>
                      <span className="donut-tooltip-pct">{data.percent}%</span>
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="donut-center-core" aria-hidden="true">
          <span className="donut-core-label">{centerLabel}</span>
          <strong className="donut-core-value" style={{ fontSize: amountFontSize }}>
            {formattedAmount}
          </strong>
        </div>
      </div>
    </div>
  );
};

