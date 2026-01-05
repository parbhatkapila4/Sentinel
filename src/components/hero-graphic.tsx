export function HeroGraphic() {
  return (
    <div className="w-full h-full flex items-center justify-center py-8">
      <svg
        viewBox="0 0 400 600"
        className="w-full h-auto max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>

          <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
          </linearGradient>

          <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="8"
              floodColor="#3b82f6"
              floodOpacity="0.3"
            />
          </filter>
        </defs>

        <rect width="400" height="600" fill="url(#bgGradient)" rx="28" />

        <g transform="translate(200, 100)">
          <circle cx="0" cy="0" r="75" fill="url(#blueGlow)" opacity="0.3" />

          <circle
            cx="0"
            cy="0"
            r="65"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <circle
            cx="0"
            cy="0"
            r="50"
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <circle
            cx="0"
            cy="0"
            r="35"
            stroke="#3b82f6"
            strokeWidth="2.5"
            fill="none"
            opacity="0.4"
          />

          <circle cx="0" cy="0" r="20" fill="#3b82f6" opacity="0.2" />
          <circle cx="0" cy="0" r="12" fill="#3b82f6" opacity="0.4" />
          <circle cx="0" cy="0" r="6" fill="#3b82f6" filter="url(#glow)" />

          <g opacity="0.5">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-65"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="0"
              x2="65"
              y2="0"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="0"
              x2="46"
              y2="-46"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="0"
              x2="-46"
              y2="-46"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          <circle cx="40" cy="-40" r="5" fill="#10b981" filter="url(#glow)" />
          <circle cx="-35" cy="35" r="5" fill="#ef4444" filter="url(#glow)" />
          <circle cx="50" cy="25" r="5" fill="#f59e0b" filter="url(#glow)" />
        </g>

        <g transform="translate(50, 240)">
          <g filter="url(#shadow)">
            <rect
              x="0"
              y="0"
              width="300"
              height="90"
              rx="20"
              fill="url(#cardGrad1)"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            <rect
              x="24"
              y="24"
              width="220"
              height="12"
              rx="6"
              fill="#10b981"
              opacity="0.3"
            />
            <rect
              x="24"
              y="48"
              width="180"
              height="10"
              rx="5"
              fill="#ffffff"
              opacity="0.6"
            />
            <rect
              x="24"
              y="65"
              width="140"
              height="8"
              rx="4"
              fill="#ffffff"
              opacity="0.4"
            />
            <circle cx="270" cy="45" r="14" fill="#10b981" opacity="0.5" />
            <circle cx="270" cy="45" r="8" fill="#10b981" />
            <text
              x="150"
              y="85"
              fill="#10b981"
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              ACTIVE • 0.2 RISK
            </text>
          </g>

          <g transform="translate(12, 12)" filter="url(#shadow)">
            <rect
              x="0"
              y="0"
              width="300"
              height="90"
              rx="20"
              fill="url(#cardGrad2)"
              stroke="#ef4444"
              strokeWidth="2.5"
            />
            <rect
              x="24"
              y="24"
              width="240"
              height="12"
              rx="6"
              fill="#ef4444"
              opacity="0.4"
            />
            <rect
              x="24"
              y="48"
              width="200"
              height="10"
              rx="5"
              fill="#ffffff"
              opacity="0.6"
            />
            <rect
              x="24"
              y="65"
              width="160"
              height="8"
              rx="4"
              fill="#ffffff"
              opacity="0.4"
            />
            <circle cx="270" cy="45" r="14" fill="#ef4444" opacity="0.6" />
            <circle cx="270" cy="45" r="8" fill="#ef4444" />
            <text
              x="150"
              y="85"
              fill="#ef4444"
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              AT RISK • 0.7 RISK
            </text>
          </g>

          <g transform="translate(24, 24)" filter="url(#shadow)">
            <rect
              x="0"
              y="0"
              width="300"
              height="90"
              rx="20"
              fill="url(#cardGrad2)"
              stroke="#f59e0b"
              strokeWidth="2.5"
            />
            <rect
              x="24"
              y="24"
              width="260"
              height="12"
              rx="6"
              fill="#f59e0b"
              opacity="0.5"
            />
            <rect
              x="24"
              y="48"
              width="220"
              height="10"
              rx="5"
              fill="#ffffff"
              opacity="0.7"
            />
            <rect
              x="24"
              y="65"
              width="180"
              height="8"
              rx="4"
              fill="#ffffff"
              opacity="0.5"
            />
            <circle cx="270" cy="45" r="14" fill="#f59e0b" opacity="0.7" />
            <circle cx="270" cy="45" r="8" fill="#f59e0b" />
            <text
              x="150"
              y="85"
              fill="#f59e0b"
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
            >
              CRITICAL • 0.9 RISK
            </text>
          </g>
        </g>

        <g transform="translate(50, 420)">
          <rect
            x="0"
            y="0"
            width="120"
            height="140"
            rx="16"
            fill="url(#cardGrad1)"
            stroke="#3b82f6"
            strokeWidth="2.5"
            opacity="0.9"
          />

          <g transform="translate(60, 30)">
            <circle cx="0" cy="0" r="32" fill="#3b82f6" opacity="0.2" />
            <circle cx="0" cy="0" r="24" fill="#3b82f6" opacity="0.3" />
            <circle cx="0" cy="0" r="16" fill="#3b82f6" opacity="0.5" />
            <circle cx="0" cy="0" r="8" fill="#3b82f6" />
          </g>

          <rect
            x="20"
            y="80"
            width="80"
            height="6"
            rx="3"
            fill="#ffffff"
            opacity="0.5"
          />
          <rect
            x="25"
            y="95"
            width="70"
            height="5"
            rx="2.5"
            fill="#ffffff"
            opacity="0.4"
          />
          <rect
            x="30"
            y="108"
            width="60"
            height="5"
            rx="2.5"
            fill="#ffffff"
            opacity="0.3"
          />

          <text
            x="60"
            y="135"
            fill="#3b82f6"
            fontSize="32"
            fontWeight="900"
            textAnchor="middle"
          >
            550M+
          </text>
        </g>

        <g transform="translate(200, 420)">
          <rect
            x="0"
            y="0"
            width="150"
            height="140"
            rx="16"
            fill="url(#cardGrad1)"
            stroke="#3b82f6"
            strokeWidth="2.5"
            opacity="0.9"
          />

          <g transform="translate(20, 25)">
            <rect
              x="0"
              y="0"
              width="110"
              height="16"
              rx="8"
              fill="#ffffff"
              opacity="0.1"
            />

            <rect x="0" y="0" width="66" height="16" rx="8" fill="#3b82f6" />

            <text
              x="55"
              y="12"
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
            >
              60%
            </text>
          </g>

          <g transform="translate(20, 55)">
            <rect
              x="0"
              y="0"
              width="25"
              height="10"
              rx="5"
              fill="#10b981"
              opacity="0.6"
            />
            <text
              x="12.5"
              y="7"
              fill="#ffffff"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              LOW
            </text>

            <rect
              x="35"
              y="0"
              width="25"
              height="10"
              rx="5"
              fill="#f59e0b"
              opacity="0.6"
            />
            <text
              x="47.5"
              y="7"
              fill="#ffffff"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              MED
            </text>

            <rect
              x="70"
              y="0"
              width="25"
              height="10"
              rx="5"
              fill="#ef4444"
              opacity="0.6"
            />
            <text
              x="82.5"
              y="7"
              fill="#ffffff"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              HIGH
            </text>
          </g>

          <text
            x="75"
            y="100"
            fill="#3b82f6"
            fontSize="28"
            fontWeight="900"
            textAnchor="middle"
          >
            0.6
          </text>
          <text
            x="75"
            y="120"
            fill="#ffffff"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.7"
          >
            RISK SCORE
          </text>
        </g>

        <g opacity="0.25">
          <path
            d="M 200 175 Q 120 220 80 300"
            stroke="#3b82f6"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="8,6"
            strokeLinecap="round"
          />
          <path
            d="M 200 175 Q 280 220 320 300"
            stroke="#3b82f6"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="8,6"
            strokeLinecap="round"
          />
          <path
            d="M 110 420 Q 155 400 200 420"
            stroke="#3b82f6"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="8,6"
            strokeLinecap="round"
          />
        </g>

        <g opacity="0.4">
          <circle cx="150" cy="250" r="3" fill="#3b82f6" />
          <circle cx="250" cy="250" r="3" fill="#3b82f6" />
          <circle cx="175" cy="400" r="3" fill="#3b82f6" />
          <circle cx="225" cy="400" r="3" fill="#3b82f6" />
        </g>
      </svg>
    </div>
  );
}
