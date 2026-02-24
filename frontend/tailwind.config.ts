import type { Config } from "tailwindcss";

const config: Config = {
	theme: {
		extend: {
			keyframes: {
				shimmer: {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" },
				},
			},
			animation: {
				shimmer: "shimmer 1.6s infinite",
			},
		},
	},
};

export default config;
