import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

interface ExportPanelProps {
  onExportOBJ: () => void;
  onExportSTL: () => void;
  onExportScreenshot: () => void;
  onExportPointCloud: () => void;
}

export const ExportPanel = ({ onExportOBJ, onExportSTL, onExportScreenshot, onExportPointCloud }: ExportPanelProps) => {
  return (
    <Card className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-3">Export Options</h3>
      <div className="space-y-2">
        <Button onClick={onExportOBJ} variant="outline" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export as OBJ
        </Button>
        <Button onClick={onExportSTL} variant="outline" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export as STL
        </Button>
        <Button onClick={onExportScreenshot} variant="outline" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export Screenshot
        </Button>
        <Button onClick={onExportPointCloud} variant="outline" className="w-full justify-start">
          <Download className="w-4 h-4 mr-2" />
          Export Point Cloud
        </Button>
      </div>
    </Card>
  );
};
