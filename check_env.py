
try:
    import torch
    import torchvision
    print(f"Torch version: {torch.__version__}")
    print(f"Torchvision version: {torchvision.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
except ImportError as e:
    print(f"Error: {e}")
