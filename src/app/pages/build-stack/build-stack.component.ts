import { AfterViewInit, Component, HostListener } from '@angular/core';
import { BreadcrumbComponent } from "src/app/components/breadcrumb/breadcrumb.component";
import { fabric } from 'fabric';
import { colors } from 'src/app/constants/constants';
import { IonicModule } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-build-stack',
  templateUrl: './build-stack.component.html',
  styleUrls: ['./build-stack.component.scss'],
  imports: [BreadcrumbComponent, IonicModule, CommonModule, FormsModule],
})
export class BuildStackComponent implements AfterViewInit {
  currentStep = 2;
  canContinue = false;
  svgList = [{ id: 1, name: "Annular 1", group: "Annulars", path: "assets/buildersvg/annular1.svg" },
  { id: 2, name: "Annular 2", group: "Annulars", path: "assets/buildersvg/annular2.svg" },
  { id: 3, name: "Annular 3", group: "Annulars", path: "assets/buildersvg/annular3.svg" },
  { id: 4, name: "Annular 4", group: "Annulars", path: "assets/buildersvg/annular4.svg" },
  { id: 5, name: "BOP 1", group: "BOPs", path: "assets/buildersvg/bop1.svg" },
  { id: 6, name: "BOP 2", group: "BOPs", path: "assets/buildersvg/bop2.svg" },
  { id: 7, name: "Valves 1", group: "BOP Valves", path: "assets/buildersvg/valves1.svg" },
  { id: 8, name: "Valves 2", group: "BOP Valves", path: "assets/buildersvg/valves2.svg" },
  { id: 9, name: "Valves 3", group: "BOP Valves", path: "assets/buildersvg/valves3.svg" },
  { id: 10, name: "Valves 4", group: "BOP Valves", path: "assets/buildersvg/valves4.svg" },
  { id: 11, name: "Valves 5", group: "BOP Valves", path: "assets/buildersvg/valves5.svg" },
  { id: 12, name: "Valves 6", group: "BOP Valves", path: "assets/buildersvg/valves6.svg" }
  ];
  private canvas!: fabric.Canvas;
  zoomLevel = 1;
  contextMenuX = 0;
  contextMenuY = 0;
  isContextMenuVisible = false;
  isDraggingSvg = false;
  showToast = false;
  toastMessage = '';
  currentZoom = 100;
  SNAP_DISTANCE = 10;
  // guideLines: fabric.Line[] = [];
  undoStack: string[] = [];
  redoStack: string[] = [];
  private isUndoing = false;
  private isRedoing = false;
  showSymbolPanel = false;
  copiedObject: fabric.Object | null = null;
  isEditMode: boolean = true; // default is ON
  // Snapping / guide fields                   // pixels (viewport coords)
  private anchorHighlights: fabric.Circle[] = [];  // highlight dots on canvas
  // Grid config
  private snapLines: fabric.Line[] = [];
  private snapThreshold = 10; // px distance for snapping
  private gridSize = 50; // px in canvas coords


  // Add more colors to make a full palette
  colors: string[] = colors;
  showColorPalette = false;
  isCanvasEmpty = true;

  constructor() { }

  ngOnInit(): void {
    document.addEventListener('click', () => {
      this.isContextMenuVisible = false;
    });
  }

  onCanvasObjectAdded() {
    this.isCanvasEmpty = false;
  }

  ngAfterViewInit(): void {
    const canvasEl = document.getElementById('fabricCanvas') as HTMLCanvasElement;
    this.canvas = new fabric.Canvas(canvasEl, {
      selection: true,
    });
    this.initAnchorsSnapping();
    // Attach events
    this.canvas.on('object:added', (e) => {
      if (!this.isUndoing && !this.isRedoing) this.saveState();
    });
    this.canvas.on('object:modified', () => {
      if (!this.isUndoing && !this.isRedoing) this.saveState();
    });
    this.canvas.on('object:removed', () => {
      if (!this.isUndoing && !this.isRedoing) this.saveState();
    });


    // Optional: save initial empty canvas state
    this.saveState();
    const container = document.getElementById('canvas-container');
    if (container) {
      this.canvas.setWidth(container.clientWidth);
      this.canvas.setHeight(container.clientHeight);
      this.canvas.renderAll();
    }
    //this.drawGrid(25); // grid every 50px
    // Optional: Handle window resize
    window.addEventListener('resize', () => {
      if (container) {
        this.canvas.setWidth(container.clientWidth);
        this.canvas.setHeight(container.clientHeight);
        //this.drawGrid(25); // grid every 50px
        this.canvas.renderAll();
      }
    });
    //this.shuffleSvgList();
    this.canvas.renderAll();
  }

  /** Call this once after the canvas is created (e.g. in ngAfterViewInit) */
  initAnchorsSnapping() {
    // remove old handlers if re-initializing
    try { this.canvas.off('object:moving'); } catch { }
    try { this.canvas.off('object:modified'); } catch { }
    try { this.canvas.off('mouse:up'); } catch { }

    // this.canvas.on('object:moving', (e) => this.handleObjectMoveAnchors(e));
    this.canvas.on('object:modified', () => this.clearAnchorHighlights());
    this.canvas.on('mouse:up', () => this.clearAnchorHighlights());

    this.canvas.on('object:moving', (e) => this.handleObjectMove(e));
    this.canvas.on('mouse:up', () => this.clearSnapLines());
    this.canvas.on('object:modified', () => this.clearSnapLines());
  }

  private handleObjectMoveAnchors(e: fabric.IEvent) {
    const active = e.target as fabric.Object;
    if (!active) return;

    const vpt = (this.canvas.viewportTransform as number[]) || [1, 0, 0, 1, 0, 0];
    const scale = vpt[0] ?? 1;

    const aRect = active.getBoundingRect(true);
    const aAnchors = this.getAnchorsFromRect(aRect);

    let best = { distance: Infinity, ax: 0, ay: 0, bx: 0, by: 0, type: '' };

    // 🔹 Compare with other objects (anchors)
    for (const obj of this.canvas.getObjects()) {
      if (obj === active || this.snapLines.includes(obj as fabric.Line)) continue;
      const bRect = obj.getBoundingRect(true);
      const bAnchors = this.getAnchorsFromRect(bRect);

      for (const a of aAnchors) {
        for (const b of bAnchors) {
          const dist = Math.hypot(b.x - a.x, b.y - a.y);
          if (dist < best.distance) {
            best = { distance: dist, ax: a.x, ay: a.y, bx: b.x, by: b.y, type: 'anchor' };
          }
        }
      }
    }

    // 🔹 Compare with grid lines
    for (const a of aAnchors) {
      const gridX = Math.round(a.x / this.gridSize) * this.gridSize;
      const gridY = Math.round(a.y / this.gridSize) * this.gridSize;

      const dist = Math.hypot(gridX - a.x, gridY - a.y);
      if (dist < best.distance) {
        best = { distance: dist, ax: a.x, ay: a.y, bx: gridX, by: gridY, type: 'grid' };
      }
    }

    this.clearAnchorHighlights();

    if (best.distance <= this.snapThreshold) {
      const canvasX = (best.bx - vpt[4]) / scale;
      const canvasY = (best.by - vpt[5]) / scale;

      if (best.type === 'anchor') {
        const dot = new fabric.Circle({
          left: canvasX,
          top: canvasY,
          originX: 'center',
          originY: 'center',
          radius: 6 / scale,
          fill: 'rgba(255,0,0,0.95)',
          selectable: false,
          evented: false,
        });
        this.canvas.add(dot);
        dot.bringToFront();
        this.anchorHighlights.push(dot);
      } else if (best.type === 'grid') {
        const dot = new fabric.Circle({
          left: canvasX,
          top: canvasY,
          originX: 'center',
          originY: 'center',
          radius: 6 / scale,
          fill: 'rgba(0,0,255,0.95)', // 🔵 blue dot for grid
          selectable: false,
          evented: false,
        });
        this.canvas.add(dot);
        dot.bringToFront();
        this.anchorHighlights.push(dot);
      }

      const dxViewport = best.bx - best.ax;
      const dyViewport = best.by - best.ay;

      active.left = (active.left ?? 0) + dxViewport / scale;
      active.top = (active.top ?? 0) + dyViewport / scale;

      active.setCoords();
      this.canvas.requestRenderAll();
    }
  }



  private clearSnapLines() {
    this.snapLines.forEach(line => this.canvas.remove(line));
    this.snapLines = [];
  }



  handleObjectMove(e: fabric.IEvent) {
    const movingObj = e.target as fabric.Object;
    if (!movingObj || !this.canvas) return;

    // Clear old snap lines
    this.clearSnapLines();

    this.canvas.getObjects().forEach(obj => {
      if (obj === movingObj) return;

      const a = movingObj.getBoundingRect(true, true);
      const b = obj.getBoundingRect(true, true);

      // Check horizontal alignment (center X)
      if (Math.abs(a.left + a.width / 2 - (b.left + b.width / 2)) < this.snapThreshold) {
        this.drawSnapLine(
          a.left + a.width / 2,
          0,
          a.left + a.width / 2,
          this.canvas.getHeight()
        );
      }

      // Check vertical alignment (center Y)
      if (Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)) < this.snapThreshold) {
        this.drawSnapLine(
          0,
          a.top + a.height / 2,
          this.canvas.getWidth(),
          a.top + a.height / 2
        );
      }

      // Edge-to-edge snapping (left/right/top/bottom)
      if (Math.abs(a.left - b.left) < this.snapThreshold) {
        this.drawSnapLine(a.left, 0, a.left, this.canvas.getHeight());
      }
      if (Math.abs(a.left + a.width - (b.left + b.width)) < this.snapThreshold) {
        this.drawSnapLine(a.left + a.width, 0, a.left + a.width, this.canvas.getHeight());
      }
      if (Math.abs(a.top - b.top) < this.snapThreshold) {
        this.drawSnapLine(0, a.top, this.canvas.getWidth(), a.top);
      }
      if (Math.abs(a.top + a.height - (b.top + b.height)) < this.snapThreshold) {
        this.drawSnapLine(0, a.top + a.height, this.canvas.getWidth(), a.top + a.height);
      }
    });

    this.canvas.renderAll();
  }

  private drawSnapLine(x1: number, y1: number, x2: number, y2: number) {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: 'red',
      strokeWidth: 1,
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    this.canvas.add(line);
    this.snapLines.push(line);
  }

  /** compute 8 anchor points for a bounding rect (in viewport coords) */
  private getAnchorsFromRect(rect: { left: number, top: number, width: number, height: number }) {
    const left = rect.left;
    const top = rect.top;
    const right = rect.left + rect.width;
    const bottom = rect.top + rect.height;
    const centerX = left + rect.width / 2;
    const centerY = top + rect.height / 2;

    return [
      { x: left, y: top },        // top-left
      { x: centerX, y: top },        // top-center
      { x: right, y: top },        // top-right
      { x: left, y: centerY },    // mid-left
      { x: right, y: centerY },    // mid-right
      { x: left, y: bottom },     // bottom-left
      { x: centerX, y: bottom },     // bottom-center
      { x: right, y: bottom }      // bottom-right
    ];
  }

  /** remove any anchor highlight dots */
  private clearAnchorHighlights() {
    if (!this.anchorHighlights || this.anchorHighlights.length === 0) return;
    for (const h of this.anchorHighlights) {
      try { this.canvas.remove(h); } catch { }
    }
    this.anchorHighlights = [];
    this.canvas.requestRenderAll();
  }


  shuffleSvgList(): void {
    for (let i = this.svgList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.svgList[i], this.svgList[j]] = [this.svgList[j], this.svgList[i]];
    }
  }

  onCanvasRightClick(event: MouseEvent) {
    event.preventDefault(); // prevent default browser menu
    if (!this.isEditMode) {
      this.isContextMenuVisible = false;
      return; // don't show context menu when edit mode is OFF
    }
    // Edit mode ON — allow custom context menu
    this.contextMenuX = event.offsetX;
    this.contextMenuY = event.offsetY;
    this.isContextMenuVisible = true;
  }


  onTouchStart(event: TouchEvent, svgUrl: any) {
    if (!this.isEditMode) return; // prevent drag in view mode
    event.preventDefault();

    const touch = event.touches[0];

    // Use the actual HTML canvas element
    const canvasElement = this.canvas.getElement() as HTMLCanvasElement;
    const canvasRect = canvasElement.getBoundingClientRect();

    // Place SVG at touch location
    this.addSvgToCanvas(
      svgUrl,
      touch.clientX - canvasRect.left,
      touch.clientY - canvasRect.top
    );
  }

  onDragStart(event: DragEvent, svgUrl: any) {
    if (!this.isEditMode) return; // prevent drag
    event.dataTransfer?.setData('svgUrl', svgUrl);
    this.isDraggingSvg = true;
    document.getElementById('dropZone')!.style.pointerEvents = 'auto';
  }

  onDrop(event: DragEvent) {
    if (!this.isEditMode) return; // prevent drop
    event.preventDefault();
    this.isDraggingSvg = false;
    document.getElementById('dropZone')!.style.pointerEvents = 'none';

    const svgUrl = event.dataTransfer?.getData('svgUrl');
    if (svgUrl) {
      const boundingRect = (event.target as HTMLElement).getBoundingClientRect();
      const offsetX = event.clientX - boundingRect.left;
      const offsetY = event.clientY - boundingRect.top;

      // Use the same addSvgToCanvas logic
      this.addSvgToCanvas(svgUrl, offsetX, offsetY);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  addSvgToCanvas(svgUrl: string, left?: number, top?: number) {
    fabric.loadSVGFromURL(svgUrl, (objects, options) => {
      const svgGroup = fabric.util.groupSVGElements(objects, options);

      const svgWidth = options.width || svgGroup.width || 200;
      const svgHeight = options.height || svgGroup.height || 200;

      const maxSize = 150;  // Set a max size (adjust as needed)

      // Calculate scale factor to limit max width/height
      const scaleFactor = Math.min(1, maxSize / Math.max(svgWidth, svgHeight));

      svgGroup.set({
        left: left ?? (this.canvas.getWidth() / 2 - (svgWidth * scaleFactor) / 2),
        top: top ?? (this.canvas.getHeight() / 2 - (svgHeight * scaleFactor) / 2),
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        selectable: true,
      });

      const newCanvasWidth = Math.max(this.canvas.getWidth(), (svgGroup.left ?? 0) + (svgWidth / 3));
      const newCanvasHeight = Math.max(this.canvas.getHeight(), (svgGroup.top ?? 0) + (svgHeight / 3));

      this.canvas.setWidth(newCanvasWidth);
      this.canvas.setHeight(newCanvasHeight);

      this.canvas.add(svgGroup);
      this.canvas.renderAll();
      this.saveState();
      this.displayToast('SVG added to canvas.');
    });
  }


  removeSelected() {
    const activeObject = this.canvas.getActiveObject();

    if (!activeObject) {
      this.displayToast('No object selected to remove.');
      return;
    }

    if (activeObject.type === 'activeSelection') {
      const activeSelection = activeObject as fabric.ActiveSelection;
      activeSelection.forEachObject((obj) => {
        this.canvas.remove(obj);
      });
    } else {
      this.canvas.remove(activeObject);
    }

    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
    this.saveState();
    this.displayToast('Selected objects removed.');
  }

  zoomIn() {
    let zoom = this.canvas.getZoom();
    zoom = Math.min(zoom + 0.1, 3); // max 300%
    this.canvas.setZoom(zoom);
    this.currentZoom = Math.round(zoom * 100);
  }

  zoomOut() {
    let zoom = this.canvas.getZoom();
    zoom = Math.max(zoom - 0.1, 0.1); // min 10%
    this.canvas.setZoom(zoom);
    this.currentZoom = Math.round(zoom * 100);
  }

  displayToast(message: string, duration: number = 2000) {
    this.toastMessage = message;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, duration);
  }

  downloadSvg() {
    if (!this.canvas || this.canvas.getObjects().length === 0) {
      this.displayToast('Canvas is empty. Nothing to download!');
      return;
    }

    const svgData = this.canvas.toSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'canvas.svg';
    link.click();

    URL.revokeObjectURL(url);
  }


  selectAllObjects() {
    this.canvas.discardActiveObject();
    const allObjects = this.canvas.getObjects();

    const activeSelection = new fabric.ActiveSelection(allObjects, {
      canvas: this.canvas
    });

    this.canvas.setActiveObject(activeSelection);
    this.canvas.requestRenderAll();
  }

  unselectAllObjects() {
    this.canvas.discardActiveObject();
    this.canvas.requestRenderAll();
  }

  resetCanvas() {
    if (!this.canvas) return;

    this.canvas.clear();

    const container = document.getElementById('canvas-container');
    if (container) {
      this.canvas.setWidth(container.clientWidth);
      this.canvas.setHeight(container.clientHeight);
    }

    this.canvas.setZoom(1);
    this.currentZoom = 100;
    this.canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
    this.canvas.requestRenderAll();

    this.displayToast('Canvas reset to container size with zoom 100%.');
  }

  groupSelected() {
    const activeObject = this.canvas.getActiveObject();

    if (activeObject && activeObject.type === 'activeSelection') {
      const activeSelection = activeObject as fabric.ActiveSelection;
      const objects = activeSelection.getObjects();

      // Deselect active selection first
      this.canvas.discardActiveObject();

      // Remove objects from canvas temporarily
      objects.forEach(obj => this.canvas.remove(obj));

      const group = new fabric.Group(objects, {
        left: activeSelection.left ?? 100,
        top: activeSelection.top ?? 100,
        selectable: true,
      });

      this.canvas.add(group);
      this.canvas.setActiveObject(group);
      this.canvas.requestRenderAll();
    } else {
      this.displayToast('Select multiple objects first to group.');
    }
  }

  ungroupSelected() {
    const activeObject = this.canvas.getActiveObject();

    if (!activeObject || activeObject.type !== 'group') {
      this.displayToast('Select a group to ungroup.');
      return;
    }

    const group = activeObject as fabric.Group;

    // Calculate each object’s absolute position
    const items = group.getObjects().map(obj => {
      obj.set({
        left: group.left! + obj.left!,
        top: group.top! + obj.top!,
        angle: obj.angle! + group.angle!
      });
      obj.setCoords();
      return obj;
    });

    // Remove group from canvas
    this.canvas.remove(group);

    // Add individual objects back
    items.forEach(obj => this.canvas.add(obj));

    // Optionally select all ungrouped objects
    const sel = new fabric.ActiveSelection(items, { canvas: this.canvas });
    this.canvas.setActiveObject(sel);

    this.canvas.requestRenderAll();
  }

  saveState() {
    const state = JSON.stringify(this.canvas, (key, value) => {
      // Remove references to fabric-specific internal properties to reduce JSON size
      if (key === 'canvas') return undefined;
      return value;
    });
    this.undoStack.push(state);
    this.redoStack = []; // clear redo on new action
  }

  undo() {
    if (!this.undoStack.length) return;

    this.isUndoing = true;

    const current = JSON.stringify(this.canvas);
    this.redoStack.push(current);

    const prevState = this.undoStack.pop();
    if (prevState) {
      this.canvas.loadFromJSON(prevState, () => {
        this.canvas.renderAll();
        this.isUndoing = false;
      });
    } else {
      this.isUndoing = false;
    }
  }

  redo() {
    if (!this.redoStack.length) return;

    this.isRedoing = true;

    const current = JSON.stringify(this.canvas);
    this.undoStack.push(current);

    const nextState = this.redoStack.pop();
    if (nextState) {
      this.canvas.loadFromJSON(nextState, () => {
        this.canvas.renderAll();
        this.isRedoing = false;
      });
    } else {
      this.isRedoing = false;
    }
  }

  toggleSymbolPanel(event: Event): void {
    event.stopPropagation();
    this.showSymbolPanel = !this.showSymbolPanel;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Close color palette if click is outside
    if (!target.closest('.color-palette') && !target.closest('#colorButton')) {
      this.showColorPalette = false;
    }

    // Close symbol panel if click is outside
    if (!target.closest('.symbol-panel') && !target.closest('#symbolButton')) {
      this.showSymbolPanel = false;
    }

    const menu = document.getElementById('contextMenu');
    if (!menu?.contains(event.target as Node)) {
      this.isContextMenuVisible = false;
    }
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const svgData = e.target.result;

        // Convert SVG string to a Blob URL
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        this.addSvgToCanvas(url, undefined, undefined); // Centered with optional scale
      };
      reader.readAsText(file);
    } else {
      this.displayToast('Please upload a valid SVG file.');
    }
  }


  addArrow(direction: 'right' | 'left' | 'up' | 'down'): void {
    const arrowLength = 100;
    const arrowHeadSize = 10;

    let x1 = 50, y1 = 50, x2 = 150, y2 = 50;

    if (direction === 'left') {
      x2 = x1 - arrowLength;
      y2 = y1;
    } else if (direction === 'up') {
      x2 = x1;
      y2 = y1 - arrowLength;
    } else if (direction === 'down') {
      x2 = x1;
      y2 = y1 + arrowLength;
    }

    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: 'black',
      strokeWidth: 2,
      selectable: true,
    });

    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    const arrowHead = new fabric.Triangle({
      left: x2,
      top: y2,
      originX: 'center',
      originY: 'center',
      width: arrowHeadSize,
      height: arrowHeadSize,
      fill: 'black',
      angle: angle + 90,
      selectable: false,
    });

    const arrowGroup = new fabric.Group([line, arrowHead], {
      left: 100,
      top: 100,
      selectable: true,
    });

    this.canvas.add(arrowGroup);
    this.canvas.setActiveObject(arrowGroup);
    this.canvas.requestRenderAll();
  }

  addTextbox() {
    const textbox = new fabric.Textbox('Enter name', {
      left: 150,
      top: 150,
      width: 200,            // Increased width for better editing
      fontSize: 20,
      fill: '#000000',       // Text color
      backgroundColor: 'transparent', // Transparent background
      strokeWidth: 1,        // Border thickness
      editable: true,
      borderColor: '#000000', // Border color when selected
      cornerColor: '#000000', // Corner handle color
      cornerSize: 6,
    });

    this.canvas.add(textbox);
    this.canvas.setActiveObject(textbox);
    this.canvas.renderAll();
    this.saveState();
  }

  addCircle() {
    const circle = new fabric.Circle({
      radius: 30,
      fill: 'transparent',    // Transparent fill
      stroke: '#000000',      // Black border
      strokeWidth: 2,
      left: 200,
      top: 200,
      selectable: true,
    });

    this.canvas.add(circle);
    this.canvas.renderAll();
    this.saveState();
  }

  addRectangle() {
    const rect = new fabric.Rect({
      width: 100,
      height: 50,
      fill: 'transparent',    // Transparent fill
      stroke: '#000000',      // Black border
      strokeWidth: 2,
      left: 250,
      top: 250,
      selectable: true,
    });

    this.canvas.add(rect);
    this.canvas.renderAll();
    this.saveState();
  }

  addTriangle() {
    const triangle = new fabric.Triangle({
      width: 80,
      height: 80,
      fill: 'transparent',    // Transparent fill
      stroke: '#000000',      // Black border
      strokeWidth: 2,
      left: 300,
      top: 300,
      selectable: true,
    });

    this.canvas.add(triangle);
    this.canvas.renderAll();
    this.saveState();
  }


  // addCustomSvg() {
  //   const customSvg = `
  //   <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  //     <circle cx="50" cy="50" r="40" stroke="purple" stroke-width="4" fill="yellow" />
  //   </svg>`;

  //   fabric.loadSVGFromString(customSvg, (objects, options) => {
  //     const svgGroup = fabric.util.groupSVGElements(objects, options);
  //     svgGroup.set({
  //       left: 300,
  //       top: 300,
  //       selectable: true,
  //     });

  //     this.canvas.add(svgGroup);
  //     this.canvas.renderAll();
  //     this.saveState();
  //   });
  // }


  copySelected(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        this.copiedObject = cloned;
        this.displayToast('Object copied to clipboard.');
      });
    } else {
      this.displayToast('Select an object first to copy.');
    }
  }

  pasteCopied(): void {
    if (this.copiedObject) {
      this.copiedObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (this.copiedObject!.left || 0) + 10,
          top: (this.copiedObject!.top || 0) + 10,
          evented: true,
        });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.requestRenderAll();
        this.displayToast('Object pasted.');
      });
    } else {
      this.displayToast('No object in clipboard to paste.');
    }
  }

  cutSelected(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        this.copiedObject = cloned;
        this.canvas.remove(activeObject);
        this.canvas.requestRenderAll();
        this.displayToast('Object cut to clipboard.');
      });
    } else {
      this.displayToast('Select an object first to cut.');
    }
  }

  cloneSelected(): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.clone((cloned: fabric.Object) => {
        cloned.set({
          left: (activeObject.left || 0) + 10,
          top: (activeObject.top || 0) + 10,
          evented: true,
        });
        this.canvas.add(cloned);
        this.canvas.setActiveObject(cloned);
        this.canvas.requestRenderAll();
        this.displayToast('Object cloned.');
      });
    } else {
      this.displayToast('Select an object first to clone.');
    }
  }

  toggleColorPalette(event: Event): void {
    event.stopPropagation();
    this.showColorPalette = !this.showColorPalette;
  }

  // @HostListener('document:click')
  // closeColorPalette(): void {
  //   this.showColorPalette = false;
  // }

  applyColor(color: string): void {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('fill', color);

      if ((activeObject as fabric.Group).type === 'group') {
        (activeObject as fabric.Group).getObjects().forEach(obj => obj.set('fill', color));
      }

      this.canvas.requestRenderAll();
      this.displayToast(`Color changed to ${color}`);
    } else {
      this.displayToast('Select an object first to set color.');
    }

    this.showColorPalette = false; // hide palette after selection
  }

  toggleEditMode() {
    if (!this.canvas) return;

    // Update canvas selection for multi-object select
    this.canvas.selection = this.isEditMode;

    // Enable/disable interactivity for all objects
    this.canvas.forEachObject((obj) => {
      obj.selectable = this.isEditMode;
      obj.evented = this.isEditMode;
      obj.hasControls = this.isEditMode;
      obj.hasBorders = this.isEditMode;
    });

    // Show/hide context menu functionality
    if (!this.isEditMode) this.isContextMenuVisible = false;
    const container = document.getElementById('canvas-container');
    if (container) {
      container.style.opacity = this.isEditMode ? '1' : '0.6';
      container.style.pointerEvents = 'auto'; // always keep enabled
    }

    // Re-render canvas
    this.canvas.requestRenderAll();
  }

}
