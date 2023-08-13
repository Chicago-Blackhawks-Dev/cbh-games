class HockeyRink {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private RINK_LENGTH = 100;
  private BLUE_LINE_DISTANCE = 25;
  private RED_LINE_DISTANCE = 39;
  private GOAL_WIDTH = 6;
  private GOAL_WIDTH_ON_CANVAS = 150;
  private puckRadius: number;
  private puckX: number;
  private puckY: number;
  private arrowHeadWidth = 40;
  private arrowYOffset = 45;
  private arrowLength: number;
  private arrowDistanceFromPuck = 30;
  private initialPuckPlacement: number;
  private rectangleWidth = 20; // Width of the rectangle
  private rectangleHeight = 200; // Height of the rectangle
  private rectangleRightPadding = 20; // Padding from the right side of the screen
  private rectangleVerticalPosition: number; // Vertical position from the top of the screen
  private rectangleFillPercentage = 0;
  private difficulty = 60; // The speed at which the rectangle fills (in percentage per second) 
  private accuracyArrowAngle = -90; // Start pointing 90 degrees left
  private accuracyArrowSpeed = 1; // Speed of the arrow animation in degrees per frame
  private accuracyArrowRadius = 50; // Radius of the circular pa



  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.puckRadius = this.GOAL_WIDTH_ON_CANVAS / 12;
    this.arrowLength = this.puckRadius * 10
    this.puckX = this.ctx.canvas.width / 2;
    this.puckY = this.ctx.canvas.height - this.puckRadius - 75;
    this.initialPuckPlacement = this.ctx.canvas.width / 2;
    this.rectangleVerticalPosition = this.ctx.canvas.height - (this.ctx.canvas.height / 2.5);
  }

  public addEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown, { passive: false });
    this.canvas.addEventListener('mouseup', this.handleMouseUp, { passive: false });
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false });
  }

  public removeEventListeners() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }

  private handleMouseDown = (event: MouseEvent) => {
    this.handlePuckClick(event.clientX, event.clientY);
    this.handleArrowClick(event.clientX, event.clientY);
  };

  private handleMouseUp = () => {
    // Stop moving the puck when the mouse button is released
  };

  private handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleArrowClick(touch.clientX, touch.clientY);
  };

  private handleTouchEnd = () => {
    // Stop moving the puck when the touch ends
  };

  private handleArrowClick(x: number, y: number) {
    const shaftLength = this.arrowLength - this.arrowHeadWidth;
    const shaftThickness = 5; // Same thickness as defined in drawArrows

    // Check if the click/touch is within the vertical bounds of the arrows
    if (y > this.puckY + this.puckRadius + this.arrowYOffset - shaftThickness / 2 && y < this.puckY + this.puckRadius + this.arrowYOffset + shaftThickness / 2) {
      // Check if the click/touch is within the horizontal bounds of the left arrowhead
      if (x > this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - this.arrowLength && x < this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - shaftLength) {
        this.puckX -= 5; // Move the puck to the left
      }
      // Check if the click/touch is within the horizontal bounds of the right arrowhead
      else if (x > this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck + shaftLength && x < this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck + this.arrowLength) {
        this.puckX += 5; // Move the puck to the right
      }
    }
    // Redraw the scene
    this.drawRink();
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawRink() {
    this.clearCanvas();
    this.drawIce();
    this.drawRedLine();
    this.drawGoal();
    this.drawPuck();
    this.drawArrows();
    this.drawRectangle();
    this.drawAnimatedArrow();
  }

  public startPowerAnimation() {
    setInterval(() => {
      this.updateFill();
    }, 1000 / this.difficulty);
  }

  public startAccuracyAnimation() {
    setInterval(() => {
      this.drawRink();
    }, 1000 / this.difficulty);
  }

  private drawIce() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height * 2 / 3);
  }

  private drawRedLine() {
    const SCALE_Y = (this.ctx.canvas.height * 2 / 3) / this.RINK_LENGTH;
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, (this.RINK_LENGTH - this.BLUE_LINE_DISTANCE - this.RED_LINE_DISTANCE) * SCALE_Y, this.ctx.canvas.width, 2);
  }

  private drawGoal() {
    const SCALE_X = this.GOAL_WIDTH_ON_CANVAS / this.GOAL_WIDTH;
    const SCALE_Y = (this.ctx.canvas.height * 2 / 3) / this.RINK_LENGTH;
    const goalY = (this.RINK_LENGTH - this.BLUE_LINE_DISTANCE - this.RED_LINE_DISTANCE) * SCALE_Y;
    const goalCenterX = this.ctx.canvas.width / 2;
    const goalRadius = this.GOAL_WIDTH * SCALE_X / 2;

    this.ctx.beginPath();
    this.ctx.arc(goalCenterX, goalY, goalRadius, 0, Math.PI, true);
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw the three arch openings along the goal line
    const archWidth = goalRadius / 3;
    const gapWidth = archWidth / 2;
    const totalWidth = 3 * archWidth + 2 * gapWidth;

    for (let i = 0; i < 3; i++) {
      const x = goalCenterX - totalWidth / 2 + i * (archWidth + gapWidth) + archWidth / 2;
      this.ctx.beginPath();
      this.ctx.arc(x, goalY, archWidth / 2, Math.PI, 2 * Math.PI, false);
      this.ctx.strokeStyle = 'black';
      this.ctx.stroke();
    }
  }

  private drawPuck() {
    this.ctx.beginPath();
    this.ctx.arc(this.puckX, this.puckY, this.puckRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
  }

  private drawArrows() {

    const shaftLength = (this.arrowLength - this.arrowHeadWidth) - 5;
    const shaftThickness = 5; // You can adjust this value for the desired thickness

    // Draw the left arrow
    this.ctx.beginPath();
    // Draw the shaft
    this.ctx.rect(this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckY + this.puckRadius + this.arrowYOffset - shaftThickness / 2, shaftLength, shaftThickness);
    // Draw the arrowhead
    this.ctx.moveTo(this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - this.arrowLength, this.puckY + this.puckRadius + this.arrowYOffset);
    this.ctx.lineTo(this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckY + this.puckRadius + this.arrowYOffset - this.arrowHeadWidth / 2);
    this.ctx.lineTo(this.initialPuckPlacement - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckY + this.puckRadius + this.arrowYOffset + this.arrowHeadWidth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw the right arrow
    this.ctx.beginPath();
    // Draw the shaft
    this.ctx.rect(this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck, this.puckY + this.puckRadius + this.arrowYOffset - shaftThickness / 2, shaftLength, shaftThickness);
    // Draw the arrowhead
    this.ctx.moveTo(this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck + this.arrowLength, this.puckY + this.puckRadius + this.arrowYOffset);
    this.ctx.lineTo(this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck + shaftLength, this.puckY + this.puckRadius + this.arrowYOffset - this.arrowHeadWidth / 2);
    this.ctx.lineTo(this.initialPuckPlacement + this.puckRadius + this.arrowDistanceFromPuck + shaftLength, this.puckY + this.puckRadius + this.arrowYOffset + this.arrowHeadWidth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawRectangle() {
    const rectangleX = this.ctx.canvas.width - this.rectangleRightPadding - this.rectangleWidth; // Positioned along the right side of the screen
    const rectangleY = this.rectangleVerticalPosition; // Vertical position from the top of the screen
    const fillHeight = (this.rectangleFillPercentage / 100) * this.rectangleHeight;

    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(rectangleX, rectangleY, this.rectangleWidth, this.rectangleHeight);

    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(rectangleX, rectangleY + this.rectangleHeight - fillHeight, this.rectangleWidth, fillHeight);

  }

  public updateFill() {
    if (this.rectangleFillPercentage < 100) {
      this.rectangleFillPercentage += 1; // Increment the fill percentage
    } else {
      this.rectangleFillPercentage = 0; // Reset the fill percentage when it reaches 100
    }
    this.drawRink();
  }

  private handlePuckClick(x: number, y: number) {
    const distanceFromPuck = Math.sqrt((x - this.puckX) ** 2 + (y - this.puckY) ** 2);
    if (distanceFromPuck <= this.puckRadius) {
      this.rectangleFillPercentage = 100; // Stop the animation by setting the fill percentage to 100
      this.drawRink(); // Redraw the rink
    }
  }

  private drawAnimatedArrow() {
    const shaftLength = (this.arrowLength - this.arrowHeadWidth) - 5; // Length of the shaft
    const shaftThickness = 5; // Thickness of the shaft
    const arrowHeadLength = 20; // Length of the arrowhead
    const centerX = this.initialPuckPlacement; // Center of the circular path
    const centerY = this.puckY - this.accuracyArrowRadius; // Center Y of the circular path
  
    // Calculate the position of the arrowhead
    const arrowX = centerX + this.accuracyArrowRadius * Math.cos(this.accuracyArrowAngle * (Math.PI / 180));
    const arrowY = centerY + this.accuracyArrowRadius * Math.sin(this.accuracyArrowAngle * (Math.PI / 180));
  
    // Draw the shaft
    this.ctx.beginPath();
    this.ctx.rect(arrowX - shaftThickness / 2, arrowY, shaftThickness, shaftLength);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.closePath();
  
    // Draw the arrowhead
    this.ctx.beginPath();
    this.ctx.moveTo(arrowX, arrowY + shaftLength);
    this.ctx.lineTo(arrowX + this.arrowHeadWidth / 2, arrowY + shaftLength + arrowHeadLength);
    this.ctx.lineTo(arrowX - this.arrowHeadWidth / 2, arrowY + shaftLength + arrowHeadLength);
    this.ctx.closePath();
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  
    // Update the angle for the next frame
    this.accuracyArrowAngle += this.accuracyArrowSpeed;
    if (this.accuracyArrowAngle > 0) {
      this.accuracyArrowSpeed = -1; // Reverse direction
    } else if (this.accuracyArrowAngle < -180) {
      this.accuracyArrowSpeed = 1; // Reverse direction
    }
  }
}


export default HockeyRink;