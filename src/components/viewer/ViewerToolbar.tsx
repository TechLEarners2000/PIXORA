import { Button } from "@/components/ui/button";
import { Download, Home, RotateCcw, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ViewerToolbarProps {
  onReset: () => void;
  onExport: () => void;
  onToggleSettings: () => void;
}

export const ViewerToolbar = ({ onReset, onExport, onToggleSettings }: ViewerToolbarProps) => {
  return (
    <nav className="glass-card border-b border-glass-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold glow-text">Advanced 3D Viewer</h1>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="hover-glow">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" className="hover-glow border-glow" onClick={onToggleSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" className="hover-glow border-glow" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button className="bg-glow text-accent-foreground hover:bg-glow-strong" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
