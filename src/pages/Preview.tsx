import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { ViewerToolbar } from "@/components/viewer/ViewerToolbar";
import { ViewerControls } from "@/components/viewer/ViewerControls";
import { InfoPanel } from "@/components/viewer/InfoPanel";
import { ExportPanel } from "@/components/viewer/ExportPanel";
import { ViewerState, ModelInfo } from "@/types/viewer";
import { applyViewMode } from "@/utils/viewer/modes";
import { applyLighting, updateFollowLight } from "@/utils/viewer/lighting";
import { exportOBJ, exportSTL, exportScreenshot, exportPointCloud } from "@/utils/viewer/exporters";
import { calculateModelInfo, createGridHelper, createAxisHelper, centerModel } from "@/utils/viewer/geometryUtils";
import { generateDepthMapFromImage, enhanceDepthWithEdges, applyDepthMapToGeometry } from "@/utils/viewer/depthMapGenerator";
import { toast } from "sonner";

const Preview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const navigate = useNavigate();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const axisRef = useRef<THREE.AxesHelper | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [viewerState, setViewerState] = useState<ViewerState>({
    viewMode: 'smooth',
    cameraMode: 'orbit',
    lightingMode: 'default',
    materialType: 'standard',
    showGrid: true,
    showAxis: true,
    autoRotate: true,
    wireframeOverlay: false,
    edgeThickness: 1,
    edgeColor: '#00ffff',
    transparency: 1,
    metalness: 0,
    roughness: 0.5,
  });

  const updateViewerState = (updates: Partial<ViewerState>) => {
    setViewerState(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    // Get image from sessionStorage
    const storedImage = sessionStorage.getItem('uploadedImage');
    const storedName = sessionStorage.getItem('uploadedImageName');
    
    if (!storedImage) {
      navigate('/');
      return;
    }
    
    setImageData(storedImage);
    setImageName(storedName || 'image');

    // Initialize Three.js scene
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    applyLighting('default', scene, camera);

    const grid = createGridHelper();
    grid.visible = viewerState.showGrid;
    gridRef.current = grid;
    scene.add(grid);

    const axis = createAxisHelper();
    axis.visible = viewerState.showAxis;
    axisRef.current = axis;
    scene.add(axis);

    // Load texture and create 3D mesh
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(storedImage, (texture) => {
      const image = texture.image as HTMLImageElement;
      const aspectRatio = image.width / image.height;
      const segments = 400; // Ultra-high resolution for professional output
      const geometry = new THREE.PlaneGeometry(4 * aspectRatio, 4, segments, segments);
      
      // Professional-grade depth map generation
      const depthMap = generateDepthMapFromImage(texture, 2.5);
      const enhancedDepthMap = enhanceDepthWithEdges(texture, depthMap, image.width, image.height, 0.2);
      
      // Apply depth with ultra-smooth interpolation
      applyDepthMapToGeometry(geometry, enhancedDepthMap, image.width, image.height);

      // Ultra-realistic material with advanced properties
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        metalness: 0.1,
        roughness: 0.7,
        flatShading: false,
        // Enhanced for photorealism
        envMapIntensity: 1.5,
      });

      const mesh = new THREE.Mesh(geometry, material);
      centerModel(mesh);
      meshRef.current = mesh;
      scene.add(mesh);

      const info = calculateModelInfo(mesh);
      setModelInfo(info);
      toast.success("Model loaded successfully!");

      // Mouse interaction
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let rotationVelocity = { x: 0, y: 0 };

      const handleMouseDown = (e: MouseEvent) => {
        isDragging = true;
        rotationVelocity = { x: 0, y: 0 };
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
          const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
          };

          mesh.rotation.y += deltaMove.x * 0.01;
          mesh.rotation.x += deltaMove.y * 0.01;

          rotationVelocity = {
            x: deltaMove.y * 0.01,
            y: deltaMove.x * 0.01
          };
        }

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp = () => {
        isDragging = false;
      };

      const handleWheel = (e: WheelEvent) => {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(2, Math.min(10, camera.position.z));
      };

      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('wheel', handleWheel);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);

        if (!isDragging && viewerState.autoRotate && (Math.abs(rotationVelocity.x) > 0.001 || Math.abs(rotationVelocity.y) > 0.001)) {
          mesh.rotation.x += rotationVelocity.x;
          mesh.rotation.y += rotationVelocity.y;
          rotationVelocity.x *= 0.95;
          rotationVelocity.y *= 0.95;
        } else if (!isDragging && viewerState.autoRotate) {
          mesh.rotation.y += 0.002;
        }

        updateFollowLight(scene, camera);
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup function
      return () => {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('wheel', handleWheel);
      };
    });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (!meshRef.current || !sceneRef.current) return;
    applyViewMode(viewerState.viewMode, meshRef.current, sceneRef.current, viewerState.edgeColor, viewerState.edgeThickness);
  }, [viewerState.viewMode, viewerState.edgeColor, viewerState.edgeThickness]);

  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    applyLighting(viewerState.lightingMode, sceneRef.current, cameraRef.current);
  }, [viewerState.lightingMode]);

  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = viewerState.showGrid;
  }, [viewerState.showGrid]);

  useEffect(() => {
    if (axisRef.current) axisRef.current.visible = viewerState.showAxis;
  }, [viewerState.showAxis]);

  const handleReset = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
      toast.success("View reset!");
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
    }
  };

  const handleExportOBJ = () => {
    if (meshRef.current) {
      exportOBJ(meshRef.current, imageName.replace(/\.[^/.]+$/, ""));
      toast.success("Exported as OBJ!");
    }
  };

  const handleExportSTL = () => {
    if (meshRef.current) {
      exportSTL(meshRef.current, imageName.replace(/\.[^/.]+$/, ""));
      toast.success("Exported as STL!");
    }
  };

  const handleExportScreenshot = () => {
    if (rendererRef.current) {
      exportScreenshot(rendererRef.current, imageName.replace(/\.[^/.]+$/, ""));
      toast.success("Screenshot saved!");
    }
  };

  const handleExportPointCloud = () => {
    if (meshRef.current) {
      exportPointCloud(meshRef.current, imageName.replace(/\.[^/.]+$/, ""));
      toast.success("Exported as point cloud!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ViewerToolbar
        onReset={handleReset}
        onExport={() => setSettingsOpen(true)}
        onToggleSettings={() => setSettingsOpen(!settingsOpen)}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Interactive 3D Viewer</h2>
                <p className="text-muted-foreground">
                  Drag to rotate • Scroll to zoom • Use controls to switch modes
                </p>
              </div>
              <div 
                ref={containerRef} 
                className="w-full h-[600px] rounded-xl overflow-hidden glow-border"
                style={{ cursor: 'grab' }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <ViewerControls state={viewerState} onStateChange={updateViewerState} />
            <InfoPanel info={modelInfo} imageName={imageName} />
            <ExportPanel
              onExportOBJ={handleExportOBJ}
              onExportSTL={handleExportSTL}
              onExportScreenshot={handleExportScreenshot}
              onExportPointCloud={handleExportPointCloud}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
