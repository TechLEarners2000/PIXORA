import time

def preprocess_image(input_path: str):
    """
    Mock preprocessing: check resolution, remove background, generate depth/normals.
    Returns paths to processed assets.
    """
    print(f"Preprocessing {input_path}...")
    time.sleep(2) # Simulate work
    return {
        "mask": input_path + "_mask.png",
        "depth": input_path + "_depth.png",
        "normals": input_path + "_normals.png"
    }
