import * as THREE from 'three';
import { ModelInfo } from '@/types/viewer';

export const calculateModelInfo = (mesh: THREE.Mesh): ModelInfo => {
  const geometry = mesh.geometry;
  const vertexCount = geometry.attributes.position.count;
  const faceCount = geometry.index ? geometry.index.count / 3 : vertexCount / 3;
  
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const boundingBox = {
    width: bbox.max.x - bbox.min.x,
    height: bbox.max.y - bbox.min.y,
    depth: bbox.max.z - bbox.min.z,
  };
  
  return {
    vertexCount,
    faceCount,
    materialCount: Array.isArray(mesh.material) ? mesh.material.length : 1,
    boundingBox,
  };
};

export const createGridHelper = (size: number = 10, divisions: number = 10): THREE.GridHelper => {
  return new THREE.GridHelper(size, divisions, 0x444444, 0x222222);
};

export const createAxisHelper = (size: number = 5): THREE.AxesHelper => {
  return new THREE.AxesHelper(size);
};

export const centerModel = (mesh: THREE.Mesh) => {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);
};

export const scaleModelToFit = (mesh: THREE.Mesh, targetSize: number = 4) => {
  const geometry = mesh.geometry;
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox!;
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxDim;
  geometry.scale(scale, scale, scale);
};
