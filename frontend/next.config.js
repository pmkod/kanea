/** @type {import('next').NextConfig} */


const nextConfig = {
	async headers() {
		return [
			{
				source: "/:path*",

				headers: [
					{
						key: "Referrer-Policy",
						value: "no-referrer, strict-origin-when-cross-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, PUT, DELETE, OPTIONS",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
				],
			},
		];
	},
}

module.exports = nextConfig
