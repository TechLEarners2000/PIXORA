import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ViewerState, ViewMode, CameraMode, LightingMode } from "@/types/viewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewerControlsProps {
  state: ViewerState;
  onStateChange: (updates: Partial<ViewerState>) => void;
}

export const ViewerControls = ({ state, onStateChange }: ViewerControlsProps) => {
  return (
    <Card className="glass-card p-4">
      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="camera">Camera</TabsTrigger>
          <TabsTrigger value="lighting">Lighting</TabsTrigger>
          <TabsTrigger value="material">Material</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>View Mode</Label>
            <Select value={state.viewMode} onValueChange={(value) => onStateChange({ viewMode: value as ViewMode })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smooth">Smooth Shading</SelectItem>
                <SelectItem value="flat">Flat Shading</SelectItem>
                <SelectItem value="wireframe">Wireframe</SelectItem>
                <SelectItem value="xray">X-Ray</SelectItem>
                <SelectItem value="inside">Inside View</SelectItem>
                <SelectItem value="outside">Outside View</SelectItem>
                <SelectItem value="edge">Edge Detection</SelectItem>
                <SelectItem value="silhouette">Silhouette</SelectItem>
                <SelectItem value="pointcloud">Point Cloud</SelectItem>
                <SelectItem value="depth">Depth Viewer</SelectItem>
                <SelectItem value="normal">Normal Map</SelectItem>
                <SelectItem value="ao">AO Shading</SelectItem>
                <SelectItem value="uv">UV Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {state.viewMode === 'edge' && (
            <>
              <div className="space-y-2">
                <Label>Edge Thickness: {state.edgeThickness}</Label>
                <Slider
                  value={[state.edgeThickness]}
                  onValueChange={([value]) => onStateChange({ edgeThickness: value })}
                  min={1}
                  max={5}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label>Edge Color</Label>
                <input
                  type="color"
                  value={state.edgeColor}
                  onChange={(e) => onStateChange({ edgeColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between">
            <Label>Show Grid</Label>
            <Switch checked={state.showGrid} onCheckedChange={(checked) => onStateChange({ showGrid: checked })} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Show Axis</Label>
            <Switch checked={state.showAxis} onCheckedChange={(checked) => onStateChange({ showAxis: checked })} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Auto Rotate</Label>
            <Switch checked={state.autoRotate} onCheckedChange={(checked) => onStateChange({ autoRotate: checked })} />
          </div>
        </TabsContent>
        
        <TabsContent value="camera" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Camera Mode</Label>
            <Select value={state.cameraMode} onValueChange={(value) => onStateChange({ cameraMode: value as CameraMode })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="orbit">Orbit</SelectItem>
                <SelectItem value="firstperson">First Person</SelectItem>
                <SelectItem value="turntable">Turntable</SelectItem>
                <SelectItem value="inside">Inside Mode</SelectItem>
                <SelectItem value="top">Top View</SelectItem>
                <SelectItem value="side">Side View</SelectItem>
                <SelectItem value="front">Front View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="lighting" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Lighting Mode</Label>
            <Select value={state.lightingMode} onValueChange={(value) => onStateChange({ lightingMode: value as LightingMode })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="hemisphere">Hemisphere</SelectItem>
                <SelectItem value="pointfollow">Point Follow</SelectItem>
                <SelectItem value="hdri">HDRI</SelectItem>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
        
        <TabsContent value="material" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Transparency: {state.transparency.toFixed(2)}</Label>
            <Slider
              value={[state.transparency]}
              onValueChange={([value]) => onStateChange({ transparency: value })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Metalness: {state.metalness.toFixed(2)}</Label>
            <Slider
              value={[state.metalness]}
              onValueChange={([value]) => onStateChange({ metalness: value })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Roughness: {state.roughness.toFixed(2)}</Label>
            <Slider
              value={[state.roughness]}
              onValueChange={([value]) => onStateChange({ roughness: value })}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label>Wireframe Overlay</Label>
            <Switch checked={state.wireframeOverlay} onCheckedChange={(checked) => onStateChange({ wireframeOverlay: checked })} />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
