import { Card } from "@/components/ui/card";
import { ModelInfo } from "@/types/viewer";

interface InfoPanelProps {
  info: ModelInfo | null;
  imageName: string;
}

export const InfoPanel = ({ info, imageName }: InfoPanelProps) => {
  if (!info) return null;
  
  return (
    <Card className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-3">Model Information</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">File:</span>
          <span className="font-medium">{imageName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vertices:</span>
          <span className="font-medium">{info.vertexCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Faces:</span>
          <span className="font-medium">{Math.floor(info.faceCount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Materials:</span>
          <span className="font-medium">{info.materialCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Size:</span>
          <span className="font-medium">
            {info.boundingBox.width.toFixed(2)} × {info.boundingBox.height.toFixed(2)} × {info.boundingBox.depth.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium text-glow">Active</span>
        </div>
      </div>
    </Card>
  );
};
