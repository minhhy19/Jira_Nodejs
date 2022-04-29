const pino = require('pino');
const { createWriteStream, createPinoBrowserSend } = require('pino-logflare');

// create pino-logflare stream
const stream = createWriteStream({
	apiKey: process.env.LOGFLARE_API_KEY,
	sourceToken: process.env.LOGFLARE_SOURCE_TOKEN
});

// create pino-logflare browser stream
const send = createPinoBrowserSend({
	apiKey: process.env.LOGFLARE_API_KEY,
	sourceToken: process.env.LOGFLARE_SOURCE_TOKEN
});

const levels = {
	http: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60
};

module.exports = pino(
	{
		browser: {
			transmit: {
				send
			}
		},
		customLevels: levels, // our defined levels
		useOnlyCustomLevels: true,
		level: 'info',
		// prettyPrint: {
		// 	colorize: true, // colorizes the log
		// 	translateTime: 'yyyy-mm-dd hh:MM:ssTT'
		// },
		serializers: {
			req: (req) => ({
				body: req.raw.body
			}),
			res: (res) => ({
				body: res.raw.body
			})
		}
	},
	stream
);

// module.exports = pino(
// 	{
// 		customLevels: levels, // our defined levels
// 		useOnlyCustomLevels: true,
// 		level: 'info',
// 		// prettyPrint: {
// 		// 	colorize: true, // colorizes the log
// 		// 	translateTime: 'yyyy-mm-dd hh:MM:ssTT'
// 		// },
// 		transport: {
// 			target: 'pino-pretty',
// 			options: {
// 				colorize: true
// 			}
// 		},
// 		browser: {
// 			transmit: {
// 				send
// 			}
// 		}
// 	},
// 	stream
// );
