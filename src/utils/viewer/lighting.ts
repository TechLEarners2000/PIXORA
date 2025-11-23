import * as THREE from 'three';
import { LightingMode } from '@/types/viewer';

export const applyLighting = (mode: LightingMode, scene: THREE.Scene, camera: THREE.Camera) => {
  // Remove existing lights
  const lights = scene.children.filter(child => child instanceof THREE.Light);
  lights.forEach(light => scene.remove(light));
  
  switch (mode) {
    case 'default':
      // Professional three-point lighting setup for ultra-realism
      const ambient = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambient);
      
      // Key light (main, brightest)
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
      keyLight.position.set(5, 5, 5);
      keyLight.castShadow = true;
      scene.add(keyLight);
      
      // Fill light (softer, opposite side)
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
      fillLight.position.set(-3, 3, 3);
      scene.add(fillLight);
      
      // Back light (rim lighting for depth perception)
      const backLight = new THREE.DirectionalLight(0xffffff, 1.2);
      backLight.position.set(0, 3, -5);
      scene.add(backLight);
      
      // Subtle accent for realism
      const accentLight = new THREE.DirectionalLight(0xccddff, 0.4);
      accentLight.position.set(-5, -2, 2);
      scene.add(accentLight);
      break;
      
    case 'hemisphere':
      const hemi = new THREE.HemisphereLight(0x0080ff, 0xff8000, 1.5);
      scene.add(hemi);
      break;
      
    case 'pointfollow':
      const ambientPoint = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientPoint);
      
      const pointLight = new THREE.PointLight(0xffffff, 2, 100);
      pointLight.position.copy(camera.position);
      pointLight.userData.followCamera = true;
      scene.add(pointLight);
      break;
      
    case 'hdri':
      const ambientHDRI = new THREE.AmbientLight(0xffffff, 1.5);
      scene.add(ambientHDRI);
      
      const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
      dir1.position.set(5, 10, 5);
      scene.add(dir1);
      
      const dir2 = new THREE.DirectionalLight(0xffffee, 0.5);
      dir2.position.set(-5, 5, -5);
      scene.add(dir2);
      break;
      
    case 'dark':
      const darkAmbient = new THREE.AmbientLight(0x202020, 1);
      scene.add(darkAmbient);
      
      const darkDir = new THREE.DirectionalLight(0x4444ff, 0.5);
      darkDir.position.set(0, 5, 5);
      scene.add(darkDir);
      break;
      
    case 'studio':
      scene.background = new THREE.Color(0xffffff);
      const studioAmbient = new THREE.AmbientLight(0xffffff, 1.2);
      scene.add(studioAmbient);
      
      const key = new THREE.DirectionalLight(0xffffff, 1);
      key.position.set(5, 10, 5);
      scene.add(key);
      
      const fill = new THREE.DirectionalLight(0xffffff, 0.3);
      fill.position.set(-5, 5, -5);
      scene.add(fill);
      
      const back = new THREE.DirectionalLight(0xffffff, 0.5);
      back.position.set(0, 5, -10);
      scene.add(back);
      break;
  }
};

export const updateFollowLight = (scene: THREE.Scene, camera: THREE.Camera) => {
  const followLight = scene.children.find(
    child => child instanceof THREE.PointLight && child.userData.followCamera
  ) as THREE.PointLight | undefined;
  
  if (followLight) {
    followLight.position.copy(camera.position);
  }
};
