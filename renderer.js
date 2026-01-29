/**
 * Renderer - Handles all canvas drawing for the seed explorer
 *
 * Responsibilities:
 * - Drawing biomes
 * - Drawing overlays (structures, slime chunks, spawn, grid)
 * - Drawing markers
 * - Hover detection for structures
 * - Camera management
 */
class Renderer {
    constructor(canvas, worldgen) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.worldgen = worldgen;

        // Camera state
        this.camera = {
            centerBlockX: 0,
            centerBlockZ: 0,
            zoom: 1.0,
            pixelsPerBlock: 1.0
        };

        // World state
        this.seed = 0;
        this.edition = 'Java';
        this.version = '1.20';
        this.dimension = 'overworld';

        // Overlay flags
        this.showStructures = true;
        this.showSlime = true;
        this.showSpawn = true;
        this.showGrid = false;

        // Cached data
        this.cachedStructures = [];
        this.markers = [];

        // Hover state
        this.hoveredStructure = null;

        // Structure Icons
        this.iconImages = {};
        this.preloadIcons();

        this.resizeCanvas();
    }

    preloadIcons() {
        const icons = [
            'village', 'desert_pyramid', 'jungle_temple', 'swamp_hut', 'igloo',
            'ocean_monument', 'mansion', 'outpost', 'shipwreck', 'fortress',
            'bastion', 'end_city', 'ruined_portal', 'ocean_ruin',
            'buried_treasure', 'stronghold', 'mineshaft'
        ];

        icons.forEach(name => {
            const img = new Image();
            img.src = `images/structures/${name}.png`;
            img.onload = () => {
                this.iconImages[name] = img;
                this.render(); // Re-render when icon loads
            };
            // Map common aliases just in case
            if (name === 'desert_pyramid') this.iconImages['desert_temple'] = img;
            if (name === 'jungle_temple') this.iconImages['jungle_pyramid'] = img;
        });
    }

    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.cssWidth = rect.width;
        this.cssHeight = rect.height;
    }

    setCamera(centerBlockX, centerBlockZ, zoom) {
        this.camera.centerBlockX = centerBlockX;
        this.camera.centerBlockZ = centerBlockZ;
        this.camera.zoom = Math.max(0.1, Math.min(20, zoom));
        this.camera.pixelsPerBlock = this.camera.zoom;
    }

    render(isInteracting = false) {
        const w = this.cssWidth;
        const h = this.cssHeight;
        const ctx = this.ctx;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Calculate visible area
        const topLeft = Coords.screenToBlock(0, 0, this.camera, w, h);
        const bottomRight = Coords.screenToBlock(w, h, this.camera, w, h);

        // Draw biomes with adaptive sampling
        this.drawBiomes(topLeft, bottomRight, w, h, isInteracting);

        // Draw overlays
        if (this.showGrid && this.camera.zoom >= 0.5) {
            this.drawChunkGrid(topLeft, bottomRight, w, h);
        }

        if (this.showSlime && this.edition === 'Java' && this.dimension === 'overworld') {
            this.drawSlimeChunks(topLeft, bottomRight, w, h);
        }

        if (this.showSpawn) {
            this.drawSpawn(w, h);
        }

        if (this.showStructures) {
            this.drawStructures(topLeft, bottomRight, w, h);
        }

        // Draw markers
        this.drawMarkers(w, h);
    }

    drawBiomes(topLeft, bottomRight, w, h, isInteracting) {
        const ctx = this.ctx;

        // Adaptive sampling: 
        // - Interaction (Dragging/Zooming): Coarse resolution (16px target) for 60FPS
        // - Idle: High resolution (4px target) for quality
        let targetPixels = isInteracting ? 16 : 4;
        const sampleSpacing = Math.max(1, Math.floor(targetPixels / this.camera.pixelsPerBlock));

        // Quantize start positions to the spacing grid to avoid "swimming" textures when panning
        const startZ = Math.floor(topLeft.blockZ / sampleSpacing) * sampleSpacing;
        const startX = Math.floor(topLeft.blockX / sampleSpacing) * sampleSpacing;

        for (let blockZ = startZ; blockZ <= bottomRight.blockZ; blockZ += sampleSpacing) {
            for (let blockX = startX; blockX <= bottomRight.blockX; blockX += sampleSpacing) {

                const biomeId = this.worldgen.getBiomeAt(
                    this.seed, this.edition, this.version, this.dimension,
                    blockX, blockZ
                );

                const biomes = this.worldgen.getAvailableBiomes(this.dimension);
                const biome = biomes[biomeId];
                const color = biome ? biome.color : '#333';

                const screen = Coords.blockToScreen(blockX, blockZ, this.camera, w, h);
                const size = sampleSpacing * this.camera.pixelsPerBlock;

                // Fill base color
                // Math.ceil ensures we don't have sub-pixel gaps between rectangles
                ctx.fillStyle = color;
                ctx.fillRect(
                    Math.floor(screen.x), 
                    Math.floor(screen.y), 
                    Math.ceil(size), 
                    Math.ceil(size)
                );
            }
        }
    }

    drawChunkGrid(topLeft, bottomRight, w, h) {
        const ctx = this.ctx;
        const minChunkX = Coords.blockToChunk(Math.floor(topLeft.blockX));
        const maxChunkX = Coords.blockToChunk(Math.ceil(bottomRight.blockX));
        const minChunkZ = Coords.blockToChunk(Math.floor(topLeft.blockZ));
        const maxChunkZ = Coords.blockToChunk(Math.ceil(bottomRight.blockZ));

        ctx.strokeStyle = 'rgba(160, 102, 255, 0.2)';
        ctx.lineWidth = 1;

        for (let cx = minChunkX; cx <= maxChunkX; cx++) {
            const blockX = cx * 16;
            const screen = Coords.blockToScreen(blockX, 0, this.camera, w, h);
            ctx.beginPath();
            ctx.moveTo(screen.x, 0);
            ctx.lineTo(screen.x, h);
            ctx.stroke();
        }

        for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
            const blockZ = cz * 16;
            const screen = Coords.blockToScreen(0, blockZ, this.camera, w, h);
            ctx.beginPath();
            ctx.moveTo(0, screen.y);
            ctx.lineTo(w, screen.y);
            ctx.stroke();
        }
    }

    drawSlimeChunks(topLeft, bottomRight, w, h) {
        const ctx = this.ctx;
        const minChunkX = Coords.blockToChunk(Math.floor(topLeft.blockX));
        const maxChunkX = Coords.blockToChunk(Math.ceil(bottomRight.blockX));
        const minChunkZ = Coords.blockToChunk(Math.floor(topLeft.blockZ));
        const maxChunkZ = Coords.blockToChunk(Math.ceil(bottomRight.blockZ));

        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';

        for (let cx = minChunkX; cx <= maxChunkX; cx++) {
            for (let cz = minChunkZ; cz <= maxChunkZ; cz++) {
                if (this.worldgen.isSlimeChunk(this.seed, this.edition, this.version, cx, cz)) {
                    const blockX = cx * 16;
                    const blockZ = cz * 16;
                    const screen = Coords.blockToScreen(blockX, blockZ, this.camera, w, h);
                    const size = 16 * this.camera.pixelsPerBlock;
                    ctx.fillRect(screen.x, screen.y, size, size);
                }
            }
        }
    }

    drawSpawn(w, h) {
        const screen = Coords.blockToScreen(0, 0, this.camera, w, h);
        const ctx = this.ctx;

        // Draw spawn marker
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(screen.x - 12, screen.y);
        ctx.lineTo(screen.x + 12, screen.y);
        ctx.moveTo(screen.x, screen.y - 12);
        ctx.lineTo(screen.x, screen.y + 12);
        ctx.stroke();

        if (this.camera.zoom >= 2) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeText('Spawn', screen.x, screen.y - 16);
            ctx.fillText('Spawn', screen.x, screen.y - 16);
        }
    }

    drawStructures(topLeft, bottomRight, w, h) {
        // Get structures in visible area
        this.cachedStructures = this.worldgen.getStructuresInArea(
            this.seed, this.edition, this.version, this.dimension,
            Math.floor(topLeft.blockX),
            Math.floor(topLeft.blockZ),
            Math.ceil(bottomRight.blockX),
            Math.ceil(bottomRight.blockZ)
        );

        const ctx = this.ctx;
        const fallbackColors = {
            village: '#fbbf24',
            desert_pyramid: '#f59e0b',
            jungle_temple: '#84cc16',
            swamp_hut: '#6b7280',
            igloo: '#60a5fa',
            ocean_monument: '#0ea5e9',
            mansion: '#a855f7',
            outpost: '#ef4444',
            shipwreck: '#94a3b8',
            fortress: '#dc2626',
            bastion: '#f97316',
            end_city: '#c084fc',
        };

        this.cachedStructures.forEach(s => {
            const screen = Coords.blockToScreen(s.blockX, s.blockZ, this.camera, w, h);
            
            // Check if mouse is hovering over this structure
            const isHovered = this.hoveredStructure &&
                             this.hoveredStructure.blockX === s.blockX &&
                             this.hoveredStructure.blockZ === s.blockZ;

            const icon = this.iconImages[s.type];

            if (icon) {
                // Draw Icon
                // Base size 24px, expand to 28px on hover
                const size = isHovered ? 28 : 24;
                
                // Draw white glow/outline behind icon if hovered for better visibility
                if (isHovered) {
                    ctx.shadowColor = 'white';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.drawImage(
                    icon, 
                    screen.x - size / 2, 
                    screen.y - size / 2, 
                    size, 
                    size
                );
                
                // Reset shadow
                ctx.shadowBlur = 0;

            } else {
                // Fallback: Colored Circle
                const color = fallbackColors[s.type] || '#ff0000';
                const size = isHovered ? 8 : 6;
                ctx.fillStyle = color;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = isHovered ? 3 : 2;

                ctx.beginPath();
                ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }

            // Draw label at medium-high zoom or when hovered
            if (this.camera.zoom >= 3 || isHovered) {
                ctx.fillStyle = '#fff';
                ctx.font = isHovered ? 'bold 12px Inter' : 'bold 10px Inter';
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                
                const label = s.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                
                // Position text below the icon (offset depends on whether it's an image or circle)
                const textY = screen.y + (icon ? 18 : 12);
                
                ctx.strokeText(label, screen.x, textY);
                ctx.fillText(label, screen.x, textY);
            }
        });
    }

    drawMarkers(w, h) {
        const ctx = this.ctx;

        this.markers.forEach((marker, idx) => {
            const screen = Coords.blockToScreen(marker.blockX, marker.blockZ, this.camera, w, h);

            // Draw marker pin
            ctx.fillStyle = '#f43f5e';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;

            // Pin shape
            ctx.beginPath();
            ctx.arc(screen.x, screen.y - 10, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - 4);
            ctx.lineTo(screen.x, screen.y + 6);
            ctx.stroke();

            // Draw label at high zoom
            if (this.camera.zoom >= 1.5) {
                ctx.fillStyle = '#fff';
                ctx.font = '11px Inter';
                ctx.textAlign = 'center';
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeText(marker.name, screen.x, screen.y - 18);
                ctx.fillText(marker.name, screen.x, screen.y - 18);
            }
        });
    }

    getBiomeAt(blockX, blockZ) {
        const biomeId = this.worldgen.getBiomeAt(
            this.seed, this.edition, this.version, this.dimension,
            blockX, blockZ
        );
        const biomes = this.worldgen.getAvailableBiomes(this.dimension);
        return biomes[biomeId] || { name: 'Unknown', color: '#333' };
    }

    findStructureAtScreenPos(screenX, screenY) {
        const block = Coords.screenToBlock(screenX, screenY, this.camera, this.cssWidth, this.cssHeight);

        // Find structure within hover radius (depends on zoom)
        const hoverRadius = Math.max(10, 20 / this.camera.pixelsPerBlock);

        for (const structure of this.cachedStructures) {
            const dx = structure.blockX - block.blockX;
            const dz = structure.blockZ - block.blockZ;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (dist < hoverRadius) {
                return structure;
            }
        }

        return null;
    }

    setHoveredStructure(structure) {
        this.hoveredStructure = structure;
    }
}
