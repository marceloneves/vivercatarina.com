import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = join(process.cwd(), 'public');
const faviconSvg = readFileSync(join(root, 'favicon.svg'), 'utf8');
const faviconDir = join(root, 'assets/img/favicons');

const pngTargets = [
	{ name: 'favicon-16x16.png', size: 16 },
	{ name: 'favicon-32x32.png', size: 32 },
	{ name: 'favicon-96x96.png', size: 96 },
	{ name: 'favicon.png', size: 96 },
	{ name: 'apple-icon-57x57.png', size: 57 },
	{ name: 'apple-icon-60x60.png', size: 60 },
	{ name: 'apple-icon-72x72.png', size: 72 },
	{ name: 'apple-icon-76x76.png', size: 76 },
	{ name: 'apple-icon-114x114.png', size: 114 },
	{ name: 'apple-icon-120x120.png', size: 120 },
	{ name: 'apple-icon-144x144.png', size: 144 },
	{ name: 'apple-icon-152x152.png', size: 152 },
	{ name: 'apple-icon-180x180.png', size: 180 },
	{ name: 'apple-icon.png', size: 180 },
	{ name: 'apple-icon-precomposed.png', size: 180 },
	{ name: 'android-icon-36x36.png', size: 36 },
	{ name: 'android-icon-48x48.png', size: 48 },
	{ name: 'android-icon-72x72.png', size: 72 },
	{ name: 'android-icon-96x96.png', size: 96 },
	{ name: 'android-icon-144x144.png', size: 144 },
	{ name: 'android-icon-192x192.png', size: 192 },
	{ name: 'android-chrome-512x512.png', size: 512 },
	{ name: 'ms-icon-144x144.png', size: 144 },
	{ name: 'ms-icon-150x150.png', size: 150 },
	{ name: 'ms-icon-310x310.png', size: 310 },
];

for (const { name, size } of pngTargets) {
	const resvg = new Resvg(faviconSvg, {
		fitTo: { mode: 'width', value: size },
	});
	const pngData = resvg.render().asPng();

	writeFileSync(join(faviconDir, name), pngData);
}

const icoSizes = [16, 32, 48];
const icoParts = icoSizes.map((size) => {
	const resvg = new Resvg(faviconSvg, {
		fitTo: { mode: 'width', value: size },
	});

	return { size, png: resvg.render().asPng() };
});

writeFileSync(join(faviconDir, 'favicon.ico'), buildIco(icoParts));
console.log(`Favicons gerados em ${faviconDir}`);

function buildIco(images) {
	const count = images.length;
	const headerSize = 6 + count * 16;
	let offset = headerSize;
	const entries = [];
	const dataChunks = [];

	for (const { size, png } of images) {
		entries.push({
			width: size >= 256 ? 0 : size,
			height: size >= 256 ? 0 : size,
			size: png.length,
			offset,
		});
		dataChunks.push(png);
		offset += png.length;
	}

	const header = Buffer.alloc(headerSize);
	header.writeUInt16LE(0, 0);
	header.writeUInt16LE(1, 2);
	header.writeUInt16LE(count, 4);

	let cursor = 6;

	for (const entry of entries) {
		header.writeUInt8(entry.width, cursor);
		header.writeUInt8(entry.height, cursor + 1);
		header.writeUInt8(0, cursor + 2);
		header.writeUInt8(0, cursor + 3);
		header.writeUInt16LE(1, cursor + 4);
		header.writeUInt16LE(32, cursor + 6);
		header.writeUInt32LE(entry.size, cursor + 8);
		header.writeUInt32LE(entry.offset, cursor + 12);
		cursor += 16;
	}

	return Buffer.concat([header, ...dataChunks]);
}
