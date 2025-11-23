import time

def generate_textures(mesh_path: str, views: list):
    """
    Mock texture generation.
    """
    print(f"Generating textures for {mesh_path}...")
    time.sleep(4)
    return {
        "albedo": "albedo.jpg",
        "normal": "normal.jpg",
        "roughness": "roughness.jpg",
        "metallic": "metallic.jpg",
        "ao": "ao.jpg"
    }
