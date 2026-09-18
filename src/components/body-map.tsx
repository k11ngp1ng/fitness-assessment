"use client";
export function BodyMap({ active = "waist" }: { active?: string }) {
  const y =
    active.includes("Thigh") || active === "thigh"
      ? 280
      : active.includes("Relaxed") ||
          active.includes("Contracted") ||
          active === "triceps"
        ? 160
        : active === "chest" ||
            active === "subscapular" ||
            active === "midaxillary" ||
            active === "trunk"
          ? 112
          : active === "hip"
            ? 232
            : active === "abdomen" || active === "abdominal"
              ? 190
              : 174;
  return (
    <div className="body-map">
      <svg
        viewBox="0 0 240 410"
        role="img"
        aria-label="Mapa corporal ilustrativo com região selecionada"
      >
        <defs>
          <linearGradient id="bodyFill" x1="0" x2="1">
            <stop stopColor="#252c23" />
            <stop offset=".5" stopColor="#3a4433" />
            <stop offset="1" stopColor="#242c22" />
          </linearGradient>
          <pattern
            id="mapGrid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0V24"
              fill="none"
              stroke="#2a3027"
              strokeWidth=".4"
            />
          </pattern>
        </defs>
        <rect width="240" height="410" fill="url(#mapGrid)" />
        <path
          d="M108 28 Q120 18 132 28 L137 46 Q136 61 128 67 L130 80 Q146 83 158 91 Q172 97 176 113 L186 161 L193 205 L188 235 Q182 241 178 231 L177 212 L169 174 L158 141 L151 164 L151 200 Q160 218 153 251 L143 296 L137 359 L143 377 Q142 385 126 382 L119 372 L120 304 L117 266 L111 304 L107 372 L101 383 Q85 388 83 379 L91 356 L91 297 L83 251 Q75 218 86 200 L86 164 L78 141 L67 174 L59 211 L59 231 Q55 242 49 235 L45 207 L52 165 L60 117 Q62 99 80 91 L105 81 L108 66 Q99 58 100 44Z"
          fill="url(#bodyFill)"
          stroke="#5b6652"
          strokeWidth="1"
        />
        <path
          d="M106 87L118 99L130 87 M86 110Q100 103 116 119Q134 104 150 111 M88 133Q102 143 116 130Q133 142 150 132 M117 99V199 M96 150Q106 155 115 151 M122 151Q131 155 142 150 M98 169H112 M123 169H140 M98 187L112 190 M123 190L140 187 M89 210L115 230L147 210 M103 239L101 286 M134 239L134 286 M96 308L99 352 M132 308L128 352"
          fill="none"
          stroke="#6e7b60"
          strokeWidth=".7"
          opacity=".55"
        />
        <ellipse
          cx="120"
          cy={y}
          rx={y > 260 ? 30 : y < 150 ? 43 : 36}
          ry="10"
          fill="#d2f56a"
          fillOpacity=".12"
          stroke="#d2f56a"
          strokeWidth="1.3"
          strokeDasharray="3 3"
        />
        <line
          x1="150"
          y1={y}
          x2="223"
          y2={y - 20}
          stroke="#d2f56a"
          strokeWidth=".7"
        />
        <circle cx="223" cy={y - 20} r="3" fill="#d2f56a" />
      </svg>
      <div className="body-map-footer">
        <span className="live-dot" /> VISTA ANTERIOR <span>ILUSTRATIVO</span>
      </div>
    </div>
  );
}
