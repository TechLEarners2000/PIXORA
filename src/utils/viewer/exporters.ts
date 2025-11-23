import * as THREE from 'three';
import { OBJExporter } from 'three-stdlib';

export const exportOBJ = (mesh: THREE.Mesh, filename: string) => {
  const exporter = new OBJExporter();
  const result = exporter.parse(mesh);
  downloadText(result, filename + '.obj');
};

export const exportSTL = (mesh: THREE.Mesh, filename: string) => {
  const geometry = mesh.geometry;
  const vertices = geometry.attributes.position.array;
  const indices = geometry.index ? geometry.index.array : null;
  
  let stl = 'solid model\n';
  
  if (indices) {
    for (let i = 0; i < indices.length; i += 3) {
      const v1 = new THREE.Vector3(
        vertices[indices[i] * 3],
        vertices[indices[i] * 3 + 1],
        vertices[indices[i] * 3 + 2]
      );
      const v2 = new THREE.Vector3(
        vertices[indices[i + 1] * 3],
        vertices[indices[i + 1] * 3 + 1],
        vertices[indices[i + 1] * 3 + 2]
      );
      const v3 = new THREE.Vector3(
        vertices[indices[i + 2] * 3],
        vertices[indices[i + 2] * 3 + 1],
        vertices[indices[i + 2] * 3 + 2]
      );
      
      const normal = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3().subVectors(v2, v1),
          new THREE.Vector3().subVectors(v3, v1)
        )
        .normalize();
      
      stl += `facet normal ${normal.x} ${normal.y} ${normal.z}\n`;
      stl += '  outer loop\n';
      stl += `    vertex ${v1.x} ${v1.y} ${v1.z}\n`;
      stl += `    vertex ${v2.x} ${v2.y} ${v2.z}\n`;
      stl += `    vertex ${v3.x} ${v3.y} ${v3.z}\n`;
      stl += '  endloop\n';
      stl += 'endfacet\n';
    }
  }
  
  stl += 'endsolid model\n';
  downloadText(stl, filename + '.stl');
};

export const exportScreenshot = (renderer: THREE.WebGLRenderer, filename: string) => {
  renderer.domElement.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename + '.png';
      link.click();
      URL.revokeObjectURL(url);
    }
  });
};

export const exportPointCloud = (mesh: THREE.Mesh, filename: string) => {
  const positions = mesh.geometry.attributes.position;
  let xyz = '';
  
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    xyz += `${x} ${y} ${z}\n`;
  }
  
  downloadText(xyz, filename + '.xyz');
};

const downloadText = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
