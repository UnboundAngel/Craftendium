import os
from PIL import Image, ImageDraw

# Target directory for your review
TARGET_DIR = "generated_icons_review"
if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)
    print(f"Created folder: {TARGET_DIR}")

def create_icon(name, color, shape='circle', size=64):
    """
    Generates a clean, flat icon with a white border.
    """
    # Create transparent image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Padding and proportions
    p = size // 8
    mid = size // 2
    
    # Draw logic based on shape
    if shape == 'house':
        # Village house shape
        coords = [
            (mid, p),           # Roof top
            (size-p, mid),      # Roof right
            (size-p, size-p),   # Bottom right
            (p, size-p),        # Bottom left
            (p, mid)            # Roof left
        ]
        draw.polygon(coords, fill=color, outline='white', width=3)
        
    elif shape == 'pyramid':
        # Triangle
        coords = [
            (mid, p),           # Top
            (size-p, size-p),   # Bottom right
            (p, size-p)         # Bottom left
        ]
        draw.polygon(coords, fill=color, outline='white', width=3)

    elif shape == 'temple':
        # Temple shape (boxy/tiered)
        draw.rectangle([p+8, mid, size-p-8, size-p], fill=color, outline='white', width=3)
        draw.rectangle([p+16, p+8, size-p-16, mid], fill=color, outline='white', width=3)

    elif shape == 'igloo':
        # Semi-circle
        draw.pieslice([p, mid-p, size-p, size+p], 180, 360, fill=color, outline='white', width=3)
        
    elif shape == 'monument':
        # Diamond/Prism shape
        coords = [
            (mid, p), (size-p, mid), (mid, size-p), (p, mid)
        ]
        draw.polygon(coords, fill=color, outline='white', width=3)

    elif shape == 'mansion':
        # Large blocky rectangle
        draw.rectangle([p, mid-4, size-p, size-p], fill=color, outline='white', width=3)
        # Roof
        draw.polygon([(p, mid-4), (mid, p), (size-p, mid-4)], fill=color, outline='white', width=3)

    elif shape == 'outpost':
        # Tower shape
        draw.rectangle([mid-8, p, mid+8, size-p], fill=color, outline='white', width=3)
        # Banner flag
        draw.polygon([(mid+8, p), (size-p, p+12), (mid+8, p+24)], fill='white', outline='white', width=1)

    elif shape == 'shipwreck':
        # Hull shape
        draw.pieslice([p, mid, size-p, size+p], 180, 360, fill=color, outline='white', width=3)
        # Mast
        draw.line([mid, mid, mid, p+8], fill='white', width=4)

    elif shape == 'fortress':
        # Castle crenelation
        draw.rectangle([p, p+16, p+16, size-p], fill=color, outline='white', width=3)
        draw.rectangle([p+16, size-p-16, size-p, size-p], fill=color, outline='white', width=3)

    elif shape == 'bastion':
        # Solid heavy block with cross
        draw.rectangle([p+8, p+8, size-p-8, size-p-8], fill=color, outline='white', width=3)
        draw.line([p+8, p+8, size-p-8, size-p-8], fill='white', width=3)
        draw.line([size-p-8, p+8, p+8, size-p-8], fill='white', width=3)

    elif shape == 'end_city':
        # Tree-like purpur structure
        draw.rectangle([mid-6, mid-8, mid+6, size-p], fill=color, outline='white', width=3)
        draw.rectangle([p+8, p+8, size-p-8, mid-8], fill=color, outline='white', width=3)

    elif shape == 'portal':
        # Tall rectangle
        draw.rectangle([mid-10, p, mid+10, size-p], fill=color, outline='white', width=3)

    elif shape == 'chest':
        # Treasure box
        draw.rectangle([p+4, mid-8, size-p-4, size-p], fill=color, outline='white', width=3)
        draw.line([p+4, mid+4, size-p-4, mid+4], fill='white', width=2)

    elif shape == 'ruin':
        # L-shaped broken wall
        draw.rectangle([p, mid, size-p, size-p], fill=color, outline='white', width=3)
        draw.rectangle([p, p+16, mid, mid], fill=color, outline='white', width=3)

    else:
        # Default Circle
        draw.ellipse([p, p, size-p, size-p], fill=color, outline='white', width=3)

    # Save
    filename = os.path.join(TARGET_DIR, f"{name}.png")
    img.save(filename)
    print(f"  ✓ {name}.png")

# Definitions (Color, Shape Type)
ICONS = {
    "village": ('#8B5A2B', 'house'),          # Brown
    "desert_pyramid": ('#D2B48C', 'pyramid'), # Tan
    "jungle_temple": ('#4F7942', 'temple'),   # Moss Green
    "swamp_hut": ('#2F4F4F', 'hut'),          # Dark Grey
    "igloo": ('#F0F8FF', 'igloo'),            # White
    "ocean_monument": ('#00CED1', 'monument'),# Teal
    "mansion": ('#3E2723', 'mansion'),        # Dark Brown
    "outpost": ('#5D4037', 'outpost'),        # Grey Brown
    "shipwreck": ('#795548', 'shipwreck'),    # Wood
    "fortress": ('#880E4F', 'fortress'),      # Dark Red
    "bastion": ('#212121', 'bastion'),        # Blackstone
    "end_city": ('#9C27B0', 'end_city'),      # Purpur
    "ruined_portal": ('#7E57C2', 'portal'),   # Obsidian Purple
    "ocean_ruin": ('#78909C', 'ruin'),        # Stone Blue
    "buried_treasure": ('#FFD600', 'chest'),  # Gold
    "stronghold": ('#546E7A', 'temple'),      # Stone Grey
    "mineshaft": ('#A1887F', 'house'),        # Light Wood
}

def main():
    print(f"Generating {len(ICONS)} icons for review...")
    for name, (color, shape) in ICONS.items():
        create_icon(name, color, shape)
    print(f"\nGeneration complete. Please check the '{TARGET_DIR}' folder.")

if __name__ == "__main__":
    main()
