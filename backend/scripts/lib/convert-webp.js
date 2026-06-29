const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOADS = path.join(__dirname, '..', '..', 'uploads');

/** Chuyển mọi PNG/JPG trong uploads → WebP (+ bản card cho ảnh số) */
async function convertUploadToWebp(filename) {
  const src = path.join(UPLOADS, filename);
  if (!fs.existsSync(src)) return null;

  const ext = path.extname(filename).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) return null;

  const base = path.basename(filename, ext);
  if (base.endsWith('-card')) return null;

  const before = fs.statSync(src).size;
  const fullOut = path.join(UPLOADS, `${base}.webp`);
  const cardOut = path.join(UPLOADS, `${base}-card.webp`);

  await sharp(src)
    .rotate()
    .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(fullOut);

  await sharp(src)
    .rotate()
    .resize(240, 320, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 78, effort: 3 })
    .toFile(cardOut);

  const after = fs.statSync(fullOut).size + fs.statSync(cardOut).size;
  console.log(`${filename} → ${base}.webp + ${base}-card.webp (${(before / 1024 / 1024).toFixed(1)}MB → ${(after / 1024).toFixed(0)}KB)`);
  return `/uploads/${base}.webp`;
}

async function convertAllUploads() {
  const files = fs.readdirSync(UPLOADS).filter((f) => /\.(png|jpe?g)$/i.test(f));
  const results = [];
  for (const file of files) {
    const url = await convertUploadToWebp(file);
    if (url) results.push({ from: `/uploads/${file}`, to: url });
  }
  return results;
}

/** Cập nhật MongoDB: mọi URL .png/.jpg → .webp tương ứng */
async function migrateDbImageUrls(Tour, Destination) {
  const pngPattern = /\.(png|jpe?g)(\?.*)?$/i;
  const tours = await Tour.find({ mainImageUrl: pngPattern }).lean();
  let tourCount = 0;
  for (const t of tours) {
    const newUrl = t.mainImageUrl.replace(pngPattern, '.webp');
    await Tour.updateOne({ _id: t._id }, { $set: { mainImageUrl: newUrl } });
    tourCount += 1;
    console.log(`Tour: ${t.mainImageUrl} → ${newUrl}`);
  }

  const dests = await Destination.find({ imageUrl: pngPattern }).lean();
  let destCount = 0;
  for (const d of dests) {
    const newUrl = d.imageUrl.replace(pngPattern, '.webp');
    await Destination.updateOne({ _id: d._id }, { $set: { imageUrl: newUrl } });
    destCount += 1;
    console.log(`Destination: ${d.imageUrl} → ${newUrl}`);
  }

  return { tourCount, destCount };
}

module.exports = {
  convertUploadToWebp,
  convertAllUploads,
  migrateDbImageUrls,
  UPLOADS,
};
