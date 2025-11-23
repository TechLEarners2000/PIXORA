import * as THREE from 'three';
import { ViewMode } from '@/types/viewer';

export const applySmooth = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshPhongMaterial({
    map: mesh.material instanceof THREE.MeshPhongMaterial ? mesh.material.map : null,
    side: THREE.FrontSide,
    flatShading: false,
    shininess: 30,
  });
  mesh.visible = true;
};

export const applyFlat = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshPhongMaterial({
    map: mesh.material instanceof THREE.MeshPhongMaterial ? mesh.material.map : null,
    side: THREE.FrontSide,
    flatShading: true,
    shininess: 10,
  });
  mesh.visible = true;
};

export const applyWireframe = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x00ffff,
  });
  mesh.visible = true;
};

export const applyXray = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshPhongMaterial({
    map: mesh.material instanceof THREE.MeshPhongMaterial ? mesh.material.map : null,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
  });
  mesh.visible = true;
};

export const applyInsideView = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshPhongMaterial({
    map: mesh.material instanceof THREE.MeshPhongMaterial ? mesh.material.map : null,
    side: THREE.DoubleSide,
  });
  mesh.visible = true;
};

export const applyEdgeDetection = (mesh: THREE.Mesh, scene: THREE.Scene, edgeColor: string, thickness: number) => {
  // Remove old edges
  const oldEdges = scene.children.filter(child => child.userData.isEdgeHelper);
  oldEdges.forEach(edge => scene.remove(edge));

  const edges = new THREE.EdgesGeometry(mesh.geometry, 15);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: edgeColor, linewidth: thickness })
  );
  line.userData.isEdgeHelper = true;
  scene.add(line);
  
  mesh.material = new THREE.MeshBasicMaterial({
    color: 0x222222,
    side: THREE.FrontSide,
  });
  mesh.visible = true;
};

export const applySilhouette = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.FrontSide,
  });
  mesh.visible = true;
};

export const applyPointCloud = (mesh: THREE.Mesh, scene: THREE.Scene) => {
  const geometry = mesh.geometry;
  const positions = geometry.attributes.position;
  
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', positions);
  
  const pointMaterial = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.05,
    sizeAttenuation: true,
  });
  
  const oldPoints = scene.children.filter(child => child.userData.isPointCloud);
  oldPoints.forEach(pt => scene.remove(pt));
  
  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.userData.isPointCloud = true;
  scene.add(points);
  
  mesh.visible = false;
};

export const applyDepthMode = (mesh: THREE.Mesh) => {
  const geometry = mesh.geometry;
  const positions = geometry.attributes.position;
  const colors = new Float32Array(positions.count * 3);
  
  let minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  
  for (let i = 0; i < positions.count; i++) {
    const z = positions.getZ(i);
    const normalized = (z - minZ) / (maxZ - minZ);
    colors[i * 3] = normalized;
    colors[i * 3 + 1] = 0.5;
    colors[i * 3 + 2] = 1 - normalized;
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  mesh.material = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });
  mesh.visible = true;
};

export const applyNormalMode = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshNormalMaterial({
    flatShading: false,
  });
  mesh.visible = true;
};

export const applyAOMode = (mesh: THREE.Mesh) => {
  mesh.material = new THREE.MeshPhongMaterial({
    map: mesh.material instanceof THREE.MeshPhongMaterial ? mesh.material.map : null,
    color: 0x888888,
    emissive: 0x000000,
    shininess: 5,
  });
  mesh.visible = true;
};

export const applyUVMode = (mesh: THREE.Mesh) => {
  const uvTexture = new THREE.TextureLoader().load(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAQElEQVQYlWNgQAX/GRgY/jMwMPxHF2NgYGBkwCbBhCHBhE2CgYGBgQFdgBGbBCOGBCM2CQYM2CQYMCSYsEkwAABvpQYI7VNerwAAAABJRU5ErkJggg=='
  );
  mesh.material = new THREE.MeshBasicMaterial({
    map: uvTexture,
  });
  mesh.visible = true;
};

export const applyViewMode = (
  mode: ViewMode,
  mesh: THREE.Mesh,
  scene: THREE.Scene,
  edgeColor: string = '#00ffff',
  thickness: number = 1
) => {
  // Clean up helpers
  const helpers = scene.children.filter(
    child => child.userData.isEdgeHelper || child.userData.isPointCloud
  );
  helpers.forEach(helper => scene.remove(helper));
  
  mesh.visible = true;
  
  switch (mode) {
    case 'smooth':
      applySmooth(mesh);
      break;
    case 'flat':
      applyFlat(mesh);
      break;
    case 'wireframe':
      applyWireframe(mesh);
      break;
    case 'xray':
      applyXray(mesh);
      break;
    case 'inside':
    case 'outside':
      applyInsideView(mesh);
      break;
    case 'edge':
      applyEdgeDetection(mesh, scene, edgeColor, thickness);
      break;
    case 'silhouette':
      applySilhouette(mesh);
      break;
    case 'pointcloud':
      applyPointCloud(mesh, scene);
      break;
    case 'depth':
      applyDepthMode(mesh);
      break;
    case 'normal':
      applyNormalMode(mesh);
      break;
    case 'ao':
      applyAOMode(mesh);
      break;
    case 'uv':
      applyUVMode(mesh);
      break;
  }
};
