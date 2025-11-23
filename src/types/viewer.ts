export type ViewMode = 
  | 'smooth'
  | 'flat'
  | 'wireframe'
  | 'xray'
  | 'inside'
  | 'outside'
  | 'edge'
  | 'silhouette'
  | 'pointcloud'
  | 'depth'
  | 'normal'
  | 'ao'
  | 'uv';

export type CameraMode = 
  | 'orbit'
  | 'firstperson'
  | 'turntable'
  | 'inside'
  | 'top'
  | 'side'
  | 'front';

export type LightingMode = 
  | 'default'
  | 'hemisphere'
  | 'pointfollow'
  | 'hdri'
  | 'dark'
  | 'studio';

export type MaterialType = 
  | 'standard'
  | 'lambert'
  | 'phong'
  | 'toon'
  | 'matcap';

export interface ModelInfo {
  vertexCount: number;
  faceCount: number;
  materialCount: number;
  boundingBox: { width: number; height: number; depth: number };
  volume?: number;
}

export interface ViewerState {
  viewMode: ViewMode;
  cameraMode: CameraMode;
  lightingMode: LightingMode;
  materialType: MaterialType;
  showGrid: boolean;
  showAxis: boolean;
  autoRotate: boolean;
  wireframeOverlay: boolean;
  edgeThickness: number;
  edgeColor: string;
  transparency: number;
  metalness: number;
  roughness: number;
}
