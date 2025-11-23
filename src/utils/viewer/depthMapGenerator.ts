import * as THREE from 'three';

/**
 * Multi-scale luminance analysis for professional depth estimation
 */
const calculateMultiScaleLuminance = (
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 3
): number => {
  let totalLum = 0;
  let count = 0;
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = Math.max(0, Math.min(width - 1, x + dx));
      const ny = Math.max(0, Math.min(height - 1, y + dy));
      const i = (ny * width + nx) * 4;
      
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Perceptual luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalLum += lum;
      count++;
    }
  }
  
  return totalLum / count;
};

/**
 * Advanced Sobel edge detection with gradient magnitude and direction
 */
const calculateEdgeIntensity = (
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number,
  height: number
): { magnitude: number; direction: number } => {
  if (x === 0 || y === 0 || x >= width - 1 || y >= height - 1) {
    return { magnitude: 0, direction: 0 };
  }
  
  // Get surrounding pixels
  const tl = getGrayscale(pixels, (y - 1) * width + (x - 1));
  const tm = getGrayscale(pixels, (y - 1) * width + x);
  const tr = getGrayscale(pixels, (y - 1) * width + (x + 1));
  const ml = getGrayscale(pixels, y * width + (x - 1));
  const mr = getGrayscale(pixels, y * width + (x + 1));
  const bl = getGrayscale(pixels, (y + 1) * width + (x - 1));
  const bm = getGrayscale(pixels, (y + 1) * width + x);
  const br = getGrayscale(pixels, (y + 1) * width + (x + 1));
  
  // Sobel operators
  const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
  const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
  
  const magnitude = Math.sqrt(gx * gx + gy * gy) / 1442;
  const direction = Math.atan2(gy, gx);
  
  return { magnitude, direction };
};

/**
 * Professional depth map generation with multi-scale analysis
 */
export const generateDepthMapFromImage = (
  texture: THREE.Texture,
  depthScale: number = 2.5
): Float32Array => {
  const image = texture.image as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  const depthMap = new Float32Array(canvas.width * canvas.height);
  
  // Calculate center for radial depth
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  
  // First pass: Multi-scale luminance with edge-aware depth
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const a = pixels[i + 3] / 255;
      
      if (a < 0.1) {
        depthMap[y * canvas.width + x] = 0;
        continue;
      }
      
      // Multi-scale luminance analysis
      const localLum = calculateMultiScaleLuminance(pixels, x, y, canvas.width, canvas.height, 2);
      const globalLum = calculateMultiScaleLuminance(pixels, x, y, canvas.width, canvas.height, 5);
      
      // Edge detection
      const edge = calculateEdgeIntensity(pixels, x, y, canvas.width, canvas.height);
      
      // Radial depth falloff
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radialFactor = 1 - (distance / maxRadius) * 0.3;
      
      // Combine luminance scales with edge information
      const combinedLum = localLum * 0.6 + globalLum * 0.4;
      const edgeBoost = 1 + (edge.magnitude * 0.3);
      
      // Calculate final depth
      const depth = combinedLum * a * depthScale * radialFactor * edgeBoost;
      depthMap[y * canvas.width + x] = depth;
    }
  }
  
  // Apply professional-grade multi-pass Gaussian blur
  let blurredDepthMap = applyGaussianBlur(depthMap, canvas.width, canvas.height, 7);
  blurredDepthMap = applyGaussianBlur(blurredDepthMap, canvas.width, canvas.height, 5);
  blurredDepthMap = applyGaussianBlur(blurredDepthMap, canvas.width, canvas.height, 3);
  
  return blurredDepthMap;
};

/**
 * Professional edge enhancement with adaptive strength
 */
export const enhanceDepthWithEdges = (
  texture: THREE.Texture,
  depthMap: Float32Array,
  width: number,
  height: number,
  edgeStrength: number = 0.2
): Float32Array => {
  const image = texture.image as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return depthMap;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  // Multi-directional edge detection
  const edges = new Float32Array(width * height);
  
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const idx = y * width + x;
      
      // Extended Sobel for better edge detection
      let gx = 0, gy = 0;
      
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const val = getGrayscale(pixels, (y + dy) * width + (x + dx));
          gx += val * getSobelX(dx, dy);
          gy += val * getSobelY(dx, dy);
        }
      }
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) / 1442;
      
      // Adaptive edge strength based on local depth variance
      const localDepthVariance = calculateLocalVariance(depthMap, x, y, width, height);
      const adaptiveStrength = 1 + (localDepthVariance * 0.5);
      
      edges[idx] = magnitude * adaptiveStrength;
    }
  }
  
  // Apply edge smoothing
  const smoothedEdges = applyGaussianBlur(edges, width, height, 2);
  
  // Combine with adaptive blending
  const enhanced = new Float32Array(width * height);
  for (let i = 0; i < depthMap.length; i++) {
    const edgeContribution = smoothedEdges[i] * edgeStrength;
    enhanced[i] = depthMap[i] * (1 + edgeContribution);
  }
  
  return enhanced;
};

/**
 * Sobel kernel coefficients
 */
const getSobelX = (dx: number, dy: number): number => {
  const kernel = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  return kernel[dy + 1][dx + 1];
};

const getSobelY = (dx: number, dy: number): number => {
  const kernel = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  return kernel[dy + 1][dx + 1];
};

/**
 * Calculate local variance for adaptive processing
 */
const calculateLocalVariance = (
  data: Float32Array,
  x: number,
  y: number,
  width: number,
  height: number
): number => {
  let sum = 0;
  let sumSq = 0;
  let count = 0;
  
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = Math.max(0, Math.min(width - 1, x + dx));
      const ny = Math.max(0, Math.min(height - 1, y + dy));
      const val = data[ny * width + nx];
      sum += val;
      sumSq += val * val;
      count++;
    }
  }
  
  const mean = sum / count;
  const variance = (sumSq / count) - (mean * mean);
  return Math.sqrt(Math.max(0, variance));
};

/**
 * Apply Gaussian blur to depth map for smoother transitions
 */
const applyGaussianBlur = (
  data: Float32Array,
  width: number,
  height: number,
  radius: number
): Float32Array => {
  const blurred = new Float32Array(width * height);
  const kernel = createGaussianKernel(radius);
  const kernelSize = kernel.length;
  const halfSize = Math.floor(kernelSize / 2);
  
  // Horizontal pass with proper edge handling
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let k = -halfSize; k <= halfSize; k++) {
        const xx = x + k;
        if (xx >= 0 && xx < width) {
          const weight = kernel[k + halfSize];
          sum += data[y * width + xx] * weight;
          weightSum += weight;
        }
      }
      
      temp[y * width + x] = weightSum > 0 ? sum / weightSum : 0;
    }
  }
  
  // Vertical pass with proper edge handling
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let weightSum = 0;
      
      for (let k = -halfSize; k <= halfSize; k++) {
        const yy = y + k;
        if (yy >= 0 && yy < height) {
          const weight = kernel[k + halfSize];
          sum += temp[yy * width + x] * weight;
          weightSum += weight;
        }
      }
      
      blurred[y * width + x] = weightSum > 0 ? sum / weightSum : 0;
    }
  }
  
  return blurred;
};

/**
 * Create a Gaussian kernel for blurring
 */
const createGaussianKernel = (radius: number): number[] => {
  const size = radius * 2 + 1;
  const kernel = new Array(size);
  let sum = 0;
  
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / (2 * radius * radius));
    sum += kernel[i];
  }
  
  // Normalize
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
};

/**
 * Get grayscale value from pixel data
 */
const getGrayscale = (pixels: Uint8ClampedArray, idx: number): number => {
  const i = idx * 4;
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

/**
 * Apply depth map to geometry with bicubic interpolation for ultra-smooth surfaces
 */
export const applyDepthMapToGeometry = (
  geometry: THREE.PlaneGeometry,
  depthMap: Float32Array,
  width: number,
  height: number
) => {
  const position = geometry.attributes.position;
  
  // Calculate smooth depth with bicubic interpolation
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    
    // Map vertex position to depth map coordinates
    const u = (x / geometry.parameters.width + 0.5);
    const v = (y / geometry.parameters.height + 0.5);
    
    // Bicubic interpolation for ultra-smooth depth
    const fx = u * (width - 1);
    const fy = v * (height - 1);
    
    const depth = bicubicInterpolation(depthMap, fx, fy, width, height);
    
    position.setZ(i, depth * 1.3); // Professional depth scale
  }
  
  position.needsUpdate = true;
  
  // Enhanced normal computation for realistic shading
  geometry.computeVertexNormals();
  
  // Smooth normals for ultra-realistic appearance
  smoothVertexNormals(geometry, 2);
};

/**
 * Bicubic interpolation for professional quality
 */
const bicubicInterpolation = (
  data: Float32Array,
  fx: number,
  fy: number,
  width: number,
  height: number
): number => {
  const x = Math.floor(fx);
  const y = Math.floor(fy);
  const dx = fx - x;
  const dy = fy - y;
  
  let sum = 0;
  
  // 4x4 kernel for bicubic interpolation
  for (let j = -1; j <= 2; j++) {
    for (let i = -1; i <= 2; i++) {
      const xi = Math.max(0, Math.min(width - 1, x + i));
      const yj = Math.max(0, Math.min(height - 1, y + j));
      const val = data[yj * width + xi] || 0;
      
      const wx = cubicWeight(i - dx);
      const wy = cubicWeight(j - dy);
      
      sum += val * wx * wy;
    }
  }
  
  return Math.max(0, sum);
};

/**
 * Cubic weight function for interpolation
 */
const cubicWeight = (t: number): number => {
  const a = -0.5;
  const absT = Math.abs(t);
  
  if (absT <= 1) {
    return (a + 2) * absT * absT * absT - (a + 3) * absT * absT + 1;
  } else if (absT < 2) {
    return a * absT * absT * absT - 5 * a * absT * absT + 8 * a * absT - 4 * a;
  }
  
  return 0;
};

/**
 * Smooth vertex normals for ultra-realistic shading
 */
const smoothVertexNormals = (geometry: THREE.PlaneGeometry, iterations: number = 2) => {
  const normalAttr = geometry.attributes.normal;
  const tempNormals = new Float32Array(normalAttr.count * 3);
  
  for (let iter = 0; iter < iterations; iter++) {
    // Copy current normals
    for (let i = 0; i < normalAttr.count * 3; i++) {
      tempNormals[i] = normalAttr.array[i];
    }
    
    // Average with neighbors
    const segmentsX = geometry.parameters.widthSegments;
    const segmentsY = geometry.parameters.heightSegments;
    
    for (let y = 1; y < segmentsY; y++) {
      for (let x = 1; x < segmentsX; x++) {
        const idx = y * (segmentsX + 1) + x;
        
        let nx = 0, ny = 0, nz = 0, count = 0;
        
        // Average with 4 neighbors
        const neighbors = [
          idx - 1, idx + 1,
          idx - (segmentsX + 1), idx + (segmentsX + 1)
        ];
        
        for (const nIdx of neighbors) {
          if (nIdx >= 0 && nIdx < normalAttr.count) {
            nx += tempNormals[nIdx * 3];
            ny += tempNormals[nIdx * 3 + 1];
            nz += tempNormals[nIdx * 3 + 2];
            count++;
          }
        }
        
        if (count > 0) {
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (len > 0) {
            normalAttr.setXYZ(idx, nx / len, ny / len, nz / len);
          }
        }
      }
    }
  }
  
  normalAttr.needsUpdate = true;
};
