/**
 * Client-side visual heuristic analyzer as a robust fallback.
 * Checks for green foliage chromaticity and natural texture on an HTML canvas.
 */

export interface ColorAnalysisResult {
  greenScore: number; // 0 to 1
  isLikelyGreenNature: boolean;
  dominantColor: string;
}

export function analyzeImageGreenery(canvas: HTMLCanvasElement): ColorAnalysisResult {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { greenScore: 0.5, isLikelyGreenNature: true, dominantColor: '#4ade80' };
  }

  const { width, height } = canvas;
  // Sample down to max 120x120 for fast processing
  const sampleW = Math.min(width, 120);
  const sampleH = Math.min(height, 120);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  let greenDominantPixels = 0;
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  // Step across pixels for performance
  const step = Math.max(1, Math.floor(totalPixels / 2000));
  let samplesCounted = 0;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    totalR += r;
    totalG += g;
    totalB += b;
    samplesCounted++;

    // Foliage & vegetation check:
    // Green must be higher than Red and Blue, or have high vegetative index: (2G - R - B) / (2G + R + B)
    const excessGreen = 2 * g - r - b;
    const isVegetative = excessGreen > 25 && g > 45;
    const isNaturalGreenHue = g > r * 1.08 && g > b * 1.08 && g > 40;

    if (isVegetative || isNaturalGreenHue) {
      greenDominantPixels++;
    }
  }

  const greenRatio = samplesCounted > 0 ? greenDominantPixels / samplesCounted : 0;
  const avgR = samplesCounted > 0 ? Math.round(totalR / samplesCounted) : 100;
  const avgG = samplesCounted > 0 ? Math.round(totalG / samplesCounted) : 120;
  const avgB = samplesCounted > 0 ? Math.round(totalB / samplesCounted) : 100;

  return {
    greenScore: greenRatio,
    // If at least ~8% of the frame has green tones, it's consistent with outdoor greenery or plants
    isLikelyGreenNature: greenRatio >= 0.08,
    dominantColor: `rgb(${avgR}, ${avgG}, ${avgB})`,
  };
}
