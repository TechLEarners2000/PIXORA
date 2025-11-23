import time

def reconstruct_3d(views: list, method: str):
    """
    Mock reconstruction: SDF or NeRF based on method.
    Returns path to raw mesh.
    """
    print(f"Reconstructing 3D model using {method}...")
    time.sleep(5) # Simulate heavy GPU work
    return "raw_mesh.obj"
