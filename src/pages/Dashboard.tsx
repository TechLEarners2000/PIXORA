import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Download, Calendar, FileType, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Dashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Mock conversion history data
  const conversions = [
    {
      id: 1,
      fileName: "spaceship_model.obj",
      fromFormat: "OBJ",
      toFormat: "GLTF",
      date: "2025-11-15",
      status: "completed"
    },
    {
      id: 2,
      fileName: "terrain_heightmap.png",
      fromFormat: "PNG",
      toFormat: "STL",
      date: "2025-11-14",
      status: "completed"
    },
    {
      id: 3,
      fileName: "character_model.fbx",
      fromFormat: "FBX",
      toFormat: "GLB",
      date: "2025-11-13",
      status: "completed"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-glass-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <Box className="w-8 h-8 text-glow" />
              <h1 className="text-2xl font-bold glow-text">3D Converter</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" className="hover-glow border-glow text-glow">
                  New Conversion
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 glow-text">Dashboard</h2>
          <p className="text-muted-foreground">Track your conversion history and downloads</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card hover-glow">
            <CardHeader>
              <CardTitle className="text-lg">Total Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-glow">{conversions.length}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-glow">2</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-glow">
            <CardHeader>
              <CardTitle className="text-lg">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-glow">45 MB</div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Conversion History</CardTitle>
            <CardDescription>Your recent 3D model conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversions.map((conversion) => (
                <div
                  key={conversion.id}
                  className="glass-card p-4 rounded-lg hover-glow flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-glow/20 flex items-center justify-center border border-glow/30">
                      <FileType className="w-6 h-6 text-glow" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{conversion.fileName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {conversion.fromFormat} → {conversion.toFormat}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {conversion.date}
                    </div>
                    <Button size="sm" variant="outline" className="hover-glow border-glow text-glow">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
