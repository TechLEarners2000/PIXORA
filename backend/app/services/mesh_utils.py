import time

def extract_and_repair_mesh(raw_mesh_path: str):
    """
    Mock mesh extraction and repair.
    """
    print(f"Extracting and repairing mesh {raw_mesh_path}...")
    time.sleep(2)
    return "clean_mesh.obj"

def retopologize(mesh_path: str, target_polygons: int):
    """
    Mock retopology.
    """
    print(f"Retopologizing {mesh_path} to {target_polygons} polys...")
    time.sleep(3)
    return "retopo_mesh.obj"
