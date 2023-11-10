class Pucko {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private pegRows: number = 8;
  private pegCols: number = 6;
  private pegSpacing: number;
  private pegRadius: number;
  private slotWidth: number;
  private gapWidth: number;
  private designWidth: number;
  private designHeight: number;
  private pegs: { x: number; y: number; radius: number }[] = [];
  private slots: { x: number; y: number; width: number; height: number; isWinning: boolean }[] = [];
  private puckRadius = 15;
  private puckXLocation: number = 0;
  private puckYLocation: number = 0;
  private centerBoardY: number;
  private centerBoardX: number;
  private isDragging = false;
  private gravity = 0.2; // Adjust as needed
  private velocityY = 0;
  private velocityX = 0;
  private isFalling = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.centerBoardY = 15;
    this.centerBoardX = this.canvas.width / 2;
    this.puckXLocation = this.centerBoardX;
    this.puckYLocation = this.centerBoardY;
    // Scale pegSpacing, pegRadius, sideWidth, and slotWidth based on new canvas size
    this.pegSpacing = this.canvas.width / (this.pegCols + 3); // Add some padding for the sides
    this.pegRadius = this.pegSpacing * 0.1; // Example relative size of peg radius
    this.slotWidth = this.pegSpacing;
    this.gapWidth = this.slotWidth / 7; //
    this.designWidth = canvas.width;
    this.designHeight = canvas.height;

    // Initial scaling and drawing
    this.initializeSlots();
    this.initializePegs();
    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => {
      this.updatePhysics();
      this.draw();
      this.animate();
    });
  }

  private updatePhysics() {
    if (this.isFalling) {
      // Update velocity with gravity
      this.velocityY += this.gravity;
      // Update the puck's Y position
      this.puckYLocation += this.velocityY;
      // const rotationSpeed = 0.1;
      // this.puckRotation += this.velocityX * rotationSpeed;
      // Stop the puck at the bottom of the canvas or when it hits something
      // This is a basic example, you might need to adjust it based on your game's logic
      this.pegs.forEach(peg => {
        if (this.isCollidingWithPeg(peg)) {
          this.respondToPegCollision(peg);
        }
      });
      if (this.puckYLocation > this.canvas.height - this.puckRadius) {
        this.puckYLocation = this.canvas.height - this.puckRadius;
        this.isFalling = false;
      }
    }
  }

  private isCollidingWithPeg(peg: { x: number; y: number; radius: number }): boolean {
    // Calculate distance between puck and peg centers
    const dx = this.puckXLocation - peg.x;
    const dy = this.puckYLocation - peg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Collision if distance is less than sum of radii
    return distance < this.puckRadius + peg.radius;
  }

  private respondToPegCollision(peg: { x: number; y: number; radius: number }) {
    // Calculate the normal vector components (from peg center to puck center)
    const dx = this.puckXLocation - peg.x;
    const dy = this.puckYLocation - peg.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / distance; // Normalize
    const ny = dy / distance; // Normalize

    // Calculate the dot product of the velocity and the normal vector
    const dotProduct = this.velocityX * nx + this.velocityY * ny;

    // Restitution coefficient (should be less than 1 to simulate energy loss)
    const restitution = 0.85; // Lower this if the bounce is still too strong

    // Reflect the velocity vector around the normal vector
    this.velocityX = restitution * (this.velocityX - 2 * dotProduct * nx);
    this.velocityY = restitution * (this.velocityY - 2 * dotProduct * ny);

    // Position adjustment to prevent puck sticking into the peg
    const pushOutDistance = this.puckRadius + peg.radius - distance;
    this.puckXLocation += nx * pushOutDistance;
    this.puckYLocation += ny * pushOutDistance;
  }
  public addEventlisteners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  public removeEventlisteners() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleMouseDown(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if the click is on the puck
    console.log('This is dragging', this.isDragging)
    if (Math.pow(mouseX - this.puckXLocation, 2) + Math.pow(mouseY - this.puckYLocation, 2) <= Math.pow(this.puckRadius, 2)) {
      this.isDragging = true;
      console.log('This is dragging', this.isDragging)
    }
  }

  private handleMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      event.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.puckXLocation = event.clientX - rect.left;
      // Keep the puck within the canvas bounds
      this.puckXLocation = Math.max(this.puckRadius, Math.min(this.puckXLocation, this.canvas.width - this.puckRadius));
      console.log('Should be moving', this.puckXLocation)
    }
  }

  private handleMouseUp(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
      this.isFalling = true;
      this.velocityY = 0;
    }
    // Implement the logic for dropping the puck vertically from here
  }

  public draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // No need to save/restore context state or apply transformation since no scaling is done

    this.drawBackground();
    // this.drawSides();
    this.pegs.forEach(peg => this.drawPeg(peg.x, peg.y, peg.radius));
    this.slots.forEach(slot => this.drawSlot(slot.x, slot.y, slot.width, slot.height, slot.isWinning));
    this.drawTitle();
    this.drawPuck();
    if (this.isDragging) {
      this.drawPuck();
    }
  }

  private drawPuck() {
    this.ctx.save(); // Save the current context state
    this.ctx.translate(this.puckXLocation, this.puckYLocation); // Move to the puck's position
    // this.ctx.rotate(this.puckRotation); // Rotate the canvas

    // Draw the puck (centered at the origin after translation)
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.puckRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.restore(); // Restore the original state
  }

  private drawBackground() {
    this.ctx.fillStyle = '#fff'; // White background
    this.ctx.fillRect(0, 0, this.designWidth, this.designHeight);
  }

  private initializePegs() {
    // Assuming midRows have 5 pegs and are centered above slots 2-6
    const slotWidth = this.slotWidth; // already calculated slot width
    const gapWidth = this.gapWidth; // already calculated gap width

    // Calculate the x positions for the pegs to align with slots 2 to 6
    // The start position for the midRows' pegs is the center of the second slot
    const xStartMidRow = this.slots[1].x + slotWidth / 2;
    // The distance between the pegs in the midRows is the distance between the centers of the slots
    const pegSpacingMidRow = (slotWidth + gapWidth);

    // Calculate yStart and ySpacing based on canvas height and number of peg rows
    const yStart = this.canvas.height * 0.2; // Assuming pegs start at 20% of the canvas height from the top
    const yEnd = this.canvas.height * 0.8; // Assuming pegs end at 80% of the canvas height from the top
    const ySpacing = (yEnd - yStart) / (this.pegRows - 1);

    // Initialize pegs array
    this.pegs = [];

    for (let row = 0; row < this.pegRows; row++) {
      // Determine the number of pegs in this row and adjust xStart accordingly
      let pegsInRow, xStart;
      if (row % 2 != 0) {
        pegsInRow = this.pegCols - 1;
        xStart = xStartMidRow;
      } else {
        pegsInRow = this.pegCols;
        xStart = (this.canvas.width - (pegSpacingMidRow * pegsInRow)) / 2;
      }

      for (let col = 0; col < pegsInRow; col++) {
        // Calculate the x position
        let x = xStart + col * pegSpacingMidRow;
        // Calculate the y position
        let y = yStart + row * ySpacing;

        this.pegs.push({ x, y, radius: this.pegRadius });
      }
    }
  }




  private drawPeg(x: number, y: number, radius: number) {
    this.ctx.fillStyle = '#000'; // Peg color
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private initializeSlots() {
    const slotHeight = this.canvas.height / 15; // Slot height is 1/10th of canvas height
    const slotWidth = this.canvas.width / 9; // There are 7 slots + 6 gaps, so divided by 9

    for (let i = 0; i < 7; i++) { // 7 slots in total
      const x = i * (slotWidth + this.gapWidth); // Calculate the x position of the slot
      const y = this.canvas.height - slotHeight; // Slots are at the bottom of the canvas
      const isWinning = i % 2 === 0; // If it's an even index, it's a winning slot (0 indexed)
      this.slots.push({ x, y, width: slotWidth, height: slotHeight, isWinning });
    }
  }

  private drawSlot(x: number, y: number, width: number, height: number, isWinning: boolean) {
    const gapWidth = width / 7; // Assume the gap is 1/7th the width of a slot
    this.ctx.fillStyle = isWinning ? 'black' : 'red';
    this.ctx.fillRect(x, y, width, height);
    // Draw the gap as a white rectangle
    if (!isWinning) {
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(x + width, y, gapWidth, height);
    }
  }

  private drawTitle() {
    const titleSize = this.canvas.height / 10;
    this.ctx.font = `${titleSize}px Arial`;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    this.ctx.beginPath();
    this.ctx.fillText('PUCKO', this.canvas.width / 2, titleSize + (titleSize * .2));
    this.ctx.closePath();
  }
}

export default Pucko;
