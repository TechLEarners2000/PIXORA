import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Palette, History, Box, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, JPEG, or WEBP image.",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for conversion.`,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleConvert = () => {
    if (!selectedFile) return;
    
    setIsConverting(true);
    toast({
      title: "Converting to 3D",
      description: "Analyzing borders and generating 3D model...",
    });

    // Convert image to base64 and store in sessionStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      sessionStorage.setItem('uploadedImage', reader.result as string);
      sessionStorage.setItem('uploadedImageName', selectedFile.name);
      
      // Simulate conversion time
      setTimeout(() => {
        setIsConverting(false);
        navigate('/preview');
      }, 2000);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-glass-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="w-8 h-8 text-glow" />
              <h1 className="text-2xl font-bold glow-text">2D to 3D Converter</h1>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button className="bg-glow text-accent-foreground hover:bg-glow-strong">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="hover-glow border-glow text-glow">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-glow text-accent-foreground hover:bg-glow-strong">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
            Transform 2D Images to
            <br />
            <span className="text-glow">3D Models</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Upload any 2D image and watch it transform into a 3D model with border analysis.
            Preview your creation in stunning 360-degree view.
          </p>

          {/* Upload Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleChooseFileClick}
            className={`glass-card rounded-2xl p-12 mb-8 transition-all cursor-pointer ${
              isDragActive ? "glow-border scale-105" : "hover-glow"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <Upload className="w-16 h-16 mx-auto mb-4 text-glow" />
            <h3 className="text-2xl font-semibold mb-2">
              {selectedFile ? selectedFile.name : "Drop your 2D image here"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {selectedFile ? "Click to choose a different file" : "or click to browse files (Max 10MB)"}
            </p>
            {!selectedFile ? (
              <Button size="lg" className="bg-glow text-accent-foreground hover:bg-glow-strong" onClick={(e) => e.stopPropagation()}>
                <Upload className="w-5 h-5 mr-2" />
                Choose File
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button size="lg" variant="outline" className="hover-glow border-glow" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                  <Upload className="w-5 h-5 mr-2" />
                  Change File
                </Button>
                <Button 
                  size="lg" 
                  className="bg-glow text-accent-foreground hover:bg-glow-strong" 
                  onClick={(e) => { e.stopPropagation(); handleConvert(); }}
                  disabled={isConverting}
                >
                  <Box className="w-5 h-5 mr-2" />
                  {isConverting ? "Converting..." : "Convert to 3D"}
                </Button>
              </div>
            )}
            <div className="mt-6 flex gap-3 justify-center flex-wrap text-sm text-muted-foreground">
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-glass-border">
                .png
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-glass-border">
                .jpg
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-glass-border">
                .jpeg
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/20 border border-glass-border">
                .webp
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-xl p-8 hover-glow transition-all">
            <div className="w-14 h-14 rounded-lg bg-glow/20 flex items-center justify-center mb-4 border border-glow/30">
              <Box className="w-7 h-7 text-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-3">360° 3D Preview</h3>
            <p className="text-muted-foreground">
              View your generated 3D model in full 360-degree rotation with interactive controls.
            </p>
          </div>

          <div className="glass-card rounded-xl p-8 hover-glow transition-all">
            <div className="w-14 h-14 rounded-lg bg-glow/20 flex items-center justify-center mb-4 border border-glow/30">
              <Palette className="w-7 h-7 text-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Border Analysis</h3>
            <p className="text-muted-foreground">
              Advanced AI-powered edge detection analyzes your image borders to create accurate 3D depth.
            </p>
          </div>

          <div className="glass-card rounded-xl p-8 hover-glow transition-all">
            <div className="w-14 h-14 rounded-lg bg-glow/20 flex items-center justify-center mb-4 border border-glow/30">
              <Download className="w-7 h-7 text-glow" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Export 3D Models</h3>
            <p className="text-muted-foreground">
              Download your converted 3D models in popular formats like OBJ, STL, or GLTF.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass-card rounded-2xl p-12 text-center glow-border">
          <h2 className="text-4xl font-bold mb-4">Ready to transform your images?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create an account to save your conversions and access advanced 3D generation features.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-glow text-accent-foreground hover:bg-glow-strong">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="hover-glow border-glow text-glow">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 2D to 3D Converter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
