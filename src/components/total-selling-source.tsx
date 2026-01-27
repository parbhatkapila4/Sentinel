"use client";

import * as React from "react";

interface SellingSource {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface TotalSellingSourceProps {
  data?: SellingSource[];
  totalSale?: number;
}

const defaultData: SellingSource[] = [
  { name: "E-Commerce", value: 1376, percentage: 40, color: "#06b6d4" },
  { name: "Website", value: 234, percentage: 38.6, color: "#8b5cf6" },
  { name: "Social Media", value: 850, percentage: 27.4, color: "#404040" },
];

export function TotalSellingSource({
  data = defaultData,
  totalSale = 37985,
}: TotalSellingSourceProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);
  const initialAngle = -90;

  const segments = data.reduce<
    Array<
      SellingSource & { pathData: string; startAngle: number; endAngle: number }
    >
  >((acc, item) => {
    const normalizedPercentage =
      totalPercentage > 0 ? (item.percentage / totalPercentage) * 100 : 0;
    const angle = (normalizedPercentage / 100) * 360;
    const currentAngle =
      acc.length > 0 ? acc[acc.length - 1].endAngle : initialAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const radius = 60;
    const innerRadius = 40;
    const centerX = 80;
    const centerY = 80;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX + innerRadius * Math.cos(startAngleRad)} ${centerY + innerRadius * Math.sin(startAngleRad)
      }`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${centerX + innerRadius * Math.cos(endAngleRad)} ${centerY + innerRadius * Math.sin(endAngleRad)
      }`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startAngleRad)
      } ${centerY + innerRadius * Math.sin(startAngleRad)}`,
    ].join(" ");

    acc.push({
      ...item,
      pathData,
      startAngle,
      endAngle,
    });

    return acc;
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Total Selling Source
          </h3>
          <p className="text-xs text-[#8a8a8a]">Total Sell in this week</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a] transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4.5h14.25M3 8.25h14.25M3 12h14.25m-14.25 3.75h14.25"
              />
            </svg>
          </button>
          <button className="p-1.5 rounded-lg text-[#8a8a8a] hover:text-white hover:bg-[#1a1a1a] transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-6">
        <div
          className="relative shrink-0"
          style={{ width: "160px", height: "160px" }}
        >
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="transform -rotate-90"
          >
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.pathData}
                fill={segment.color}
                className="transition-opacity cursor-pointer"
                style={{
                  opacity:
                    hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-white">
              ${totalSale.toLocaleString()}
            </div>
            <div className="text-xs text-[#8a8a8a] mt-1">Total Sale</div>
          </div>

          {segments.map((segment, index) => {
            const midAngle = (segment.startAngle + segment.endAngle) / 2;
            const midAngleRad = (midAngle * Math.PI) / 180;
            const labelRadius = 75;
            const labelX = 80 + labelRadius * Math.cos(midAngleRad);
            const labelY = 80 + labelRadius * Math.sin(midAngleRad);

            return (
              <text
                key={index}
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="11"
                fontWeight="600"
                className="pointer-events-none"
                transform={`rotate(${midAngle + 90} ${labelX} ${labelY})`}
              >
                {segment.percentage.toFixed(1)}%
              </text>
            );
          })}
        </div>

        <div className="flex-1 space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="text-sm text-white font-medium">
                  {item.name}
                </div>
              </div>
              <div className="text-sm font-bold text-white">
                {item.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
