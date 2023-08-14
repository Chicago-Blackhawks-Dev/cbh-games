import Rink from "./rink";

class ShootThePuck {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private rink: Rink
  private goalCoordinates: { x: number, y: number, radius: number }[] = [];
  private puckRadius = 10;
  private arrowHeadWidth = 40;
  private arrowYOffset = 45;
  private arrowLength: number;
  private arrowDistanceFromPuck = 30;
  private puckXLocation: number;
  private puckYLocation: number;
  private difficulty = 10;
  private powerReady = false;
  private power = 100;
  private powerMeterWidth = 20; // Width of the rectangle
  private powerMeterHeight = 150; //
  private powerMeterInterval?: NodeJS.Timer;
  private accuracy = 100;
  private accuracyMeterWidth = 150; // Width of the rectangle
  private accuracyMeterHeight = 20; //
  private accuracyMeterInterval?: NodeJS.Timer;
  private isPuckInMotion = false;
  private puckVelocityX = 0;
  private puckVelocityY = 0;
  private puckAnimationInterval?: NodeJS.Timer;
  private readonly animationFrameDuration = 1000 / 60; 

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.arrowLength = this.puckRadius * 10
    this.rink = new Rink(ctx, canvas);
    this.puckXLocation = this.rink.centerIceX;
    this.puckYLocation = this.rink.centerIceY;
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  public draw() {
    if (this.isPuckInMotion) {
      this.drawPuck(this.puckXLocation, this.puckYLocation);
    }
    this.clearCanvas();
    this.rink.draw();
    this.drawGoals();
    this.drawPuck(this.rink.centerIceX, this.rink.centerIceY);
    this.drawArrows();
    this.drawPowerMeter();
    if (this.powerReady) {
      this.drawAccuracyMeter();
    }
  }

  private drawGoals() {
    const goalY = (this.rink.centerIceY - this.rink.goalineOffset) + this.rink.boardWidth; // Adjust this based on the position of your goal net
    const goalCenterX = this.rink.centerIceX;
    const goalRadius = this.rink.goalOffset / 2;
    const archWidth = goalRadius / 3;
    const gapWidth = archWidth / 2;
    const totalWidth = 3 * archWidth + 2 * gapWidth;

    this.goalCoordinates = [];

    // Draw the three arch openings along the goal line
    for (let i = 0; i < 3; i++) {
      const x = goalCenterX - totalWidth / 2 + i * (archWidth + gapWidth) + archWidth / 2;
      this.ctx.beginPath();
      this.ctx.arc(x, goalY, archWidth / 2, Math.PI, 2 * Math.PI, false);
      this.ctx.strokeStyle = 'black'; // Change this color as needed
      this.ctx.stroke();

      this.goalCoordinates.push({ x, y: goalY, radius: archWidth / 2 });
    }
  }

  private drawPuck(x: number, y: number) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.puckRadius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
  }

  private drawArrows() {

    const shaftLength = (this.arrowLength - this.arrowHeadWidth) - 5;
    const shaftThickness = 5; // You can adjust this value for the desired thickness

    // Draw the left arrow
    this.ctx.beginPath();
    // Draw the shaft
    this.ctx.rect(this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckYLocation + this.puckRadius + this.arrowYOffset - shaftThickness / 2, shaftLength, shaftThickness);
    // Draw the arrowhead
    this.ctx.moveTo(this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - this.arrowLength, this.puckYLocation + this.puckRadius + this.arrowYOffset);
    this.ctx.lineTo(this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckYLocation + this.puckRadius + this.arrowYOffset - this.arrowHeadWidth / 2);
    this.ctx.lineTo(this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - shaftLength, this.puckYLocation + this.puckRadius + this.arrowYOffset + this.arrowHeadWidth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw the right arrow
    this.ctx.beginPath();
    // Draw the shaft
    this.ctx.rect(this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck, this.puckYLocation + this.puckRadius + this.arrowYOffset - shaftThickness / 2, shaftLength, shaftThickness);
    // Draw the arrowhead
    this.ctx.moveTo(this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck + this.arrowLength, this.puckYLocation + this.puckRadius + this.arrowYOffset);
    this.ctx.lineTo(this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck + shaftLength, this.puckYLocation + this.puckRadius + this.arrowYOffset - this.arrowHeadWidth / 2);
    this.ctx.lineTo(this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck + shaftLength, this.puckYLocation + this.puckRadius + this.arrowYOffset + this.arrowHeadWidth / 2);
    this.ctx.closePath();
    this.ctx.fillStyle = 'black';
    this.ctx.fill();
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
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


  private handleTouchStart = (event: TouchEvent) => {
    event.preventDefault();
    const touch = event.touches[0];
    this.handleArrowClick(touch.clientX, touch.clientY);
    this.handlePuckClick(touch.clientX, touch.clientY);
  };

  private handleTouchEnd = () => {
    // Stop moving the puck when the touch ends
  };

  private handleArrowClick(x: number, y: number) {
    const shaftLength = this.arrowLength - this.arrowHeadWidth;
    const shaftThickness = 5; // Same thickness as defined in drawArrows

    // Check if the click/touch is within the vertical bounds of the arrows
    if (y > this.puckYLocation + this.puckRadius + this.arrowYOffset - shaftThickness / 2 && y < this.puckYLocation + this.puckRadius + this.arrowYOffset + shaftThickness / 2) {
      // Check if the click/touch is within the horizontal bounds of the left arrowhead
      console.log('Yup')
      if (x > this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - this.arrowLength && x < this.rink.centerIceX - this.puckRadius - this.arrowDistanceFromPuck - shaftLength) {
        console.log('uhuh')
        this.puckXLocation -= 5; // Move the puck to the left
      }
      // Check if the click/touch is within the horizontal bounds of the right arrowhead
      else if (x > this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck + shaftLength && x < this.rink.centerIceX + this.puckRadius + this.arrowDistanceFromPuck + this.arrowLength) {
        console.log('ok')
        this.puckXLocation += 5; // Move the puck to the right
      }
    }
    // Redraw the scene
    this.draw();
  }

  private handleMouseDown = (event: MouseEvent) => {
    this.handlePuckClick(event.clientX, event.clientY);
    this.handleArrowClick(event.clientX, event.clientY);
  };

  private handleMouseUp = () => {
    // Stop moving the puck when the mouse button is released
  };

  public updatePowerMeter() {
    if (this.power < 100) {
      this.power += 1; // Increment the fill percentage
    } else {
      this.power = 0; // Reset the fill percentage when it reaches 100
    }
    this.draw();
  }

  public updateAccuracyMeter() {
    if (this.accuracy < 100) {
      this.accuracy += 1; // Increment the fill percentage
    } else {
      this.accuracy = 0; // Reset the fill percentage when it reaches 100
    }
    this.draw();
  }

  private drawPowerMeter() {
    const rectangleX = (this.canvas.width - this.rink.boardWidth) - 30; // Positioned along the right side of the screen
    const rectangleY = (this.rink.centerIceY - this.powerMeterHeight) - 20; // Vertical position from the top of the screen
    const fillHeight = (this.power / 100) * this.powerMeterHeight;

    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(rectangleX, rectangleY, this.powerMeterWidth, this.powerMeterHeight);

    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(rectangleX, rectangleY + this.powerMeterHeight - fillHeight, this.powerMeterWidth, fillHeight);

  }

  public startPowerAnimation() {
    this.powerMeterInterval = setInterval(() => {
      this.updatePowerMeter();
    }, 1000 / this.difficulty);
  }

  public startAccuracyAnimation() {
    this.accuracyMeterInterval = setInterval(() => {
      this.updateAccuracyMeter();
    }, 1000 / this.difficulty);
  }


  public stopPowerAnimation() {
    clearInterval(this.powerMeterInterval); // Clearing the interval to stop the animation
  }

  public stopAccuracyAnimation() {
    clearInterval(this.accuracyMeterInterval); // Clearing the interval to stop the animation
  }

  private startPuckAnimation() {
    const { x, y } = this.calculateVelocity(this.accuracy, this.power);
    this.isPuckInMotion = true;
    // Start an animation loop or a timer to update the puck's position
    this.puckAnimationInterval = setInterval(() => {
      console.log('this.puckXLocation', this.puckXLocation)
      console.log('this.puckYLocation', this.puckYLocation)
      console.log('x', x)
      console.log('y', y)
      this.puckXLocation += x;
      this.puckYLocation -= y;
      console.log('this.puckXLocation', this.puckXLocation)
      console.log('this.puckYLocation', this.puckYLocation)
      // Other updates like collision checking, slowing down due to friction, etc.
  
      this.draw();
      // If the puck stops or reaches its destination, clear the interval
      if (this.isPuckStopped()) {
        clearInterval(this.puckAnimationInterval);
      }
    }, this.animationFrameDuration);
  }

  private isPuckStopped(): boolean {
    // Define a threshold below which the puck is considered to be stopped
    const velocityThreshold = 0.1; 
  
    // Check if both the x and y components of the puck's velocity are below the threshold
    if (Math.abs(this.puckVelocityX) < velocityThreshold && Math.abs(this.puckVelocityY) < velocityThreshold) {
      return true; 
    }
  
    return this.isPuckInMotion;
  }

  private handlePuckClick(x: number, y: number) {
    const distanceFromPuck = Math.sqrt((x - this.puckXLocation) ** 2 + (y - this.puckYLocation) ** 2);
    if (distanceFromPuck <= this.puckRadius) {
      if (!this.powerReady) {
        this.stopPowerAnimation();
        this.powerReady = true;
        this.startAccuracyAnimation();
      } else {
        this.stopAccuracyAnimation();
        this.startPuckAnimation();
      }
    }
  }

  private drawAccuracyMeter() {
    const rectangleX = this.rink.centerIceX - (this.accuracyMeterWidth / 2); // Positioned along the right side of the screen
    const rectangleY = this.rink.centerIceY + 20; // Vertical position from the top of the screen
    const fillWidth = (this.accuracy / 100) * this.accuracyMeterWidth;

    this.ctx.strokeStyle = 'black';
    this.ctx.strokeRect(rectangleX, rectangleY, this.accuracyMeterWidth, this.accuracyMeterHeight);

    this.ctx.fillStyle = 'red';
    // this.ctx.fillRect(rectangleX + this.accuracyMeterWidth - fillWidth, rectangleY, fillWidth, this.accuracyMeterHeight);
    this.ctx.fillRect(rectangleX, rectangleY, fillWidth, this.accuracyMeterHeight);
  }

  private calculateVelocity(accuracy: number, initialVelocity: number) {
    const normalizedAccuracy = accuracy / 100; // A value between 0 and 1
    const deviation = 1 - normalizedAccuracy;
    const randomFactor = Math.random() * 2 - 1;
    const deviationFactor = deviation * randomFactor;
    const velocityX = initialVelocity *  deviationFactor;
    const velocityY = initialVelocity * (1 - Math.abs(deviationFactor));

    return { x: velocityX, y: velocityY };

  }

  private checkGoalCollision() {
    this.goalCoordinates.forEach(goal => {
      const dist = Math.sqrt((goal.x - this.puckXLocation) ** 2 + (goal.y - this.puckYLocation) ** 2);
      if (dist < goal.radius + this.puckRadius) {
        this.isPuckInMotion = false; // Stop the puck
        // You can add additional logic here for scoring or effects
      }
    });
  }

  public resetPuck() {
    this.isPuckInMotion = false;
    this.puckXLocation = this.rink.centerIceX;
    this.puckYLocation = this.rink.centerIceY;
    this.puckVelocityX = 0;
    this.puckVelocityY = 0;
    this.draw();
  }

  public updatePuckPosition() {
    if (this.isPuckInMotion) {
      this.puckXLocation += this.puckVelocityX;
      this.puckYLocation += this.puckVelocityY;
      
      // Check for collisions with the goals
      this.checkGoalCollision();
      
      // Other collision logic goes here, e.g., checking for walls or other objects
      
      // Redraw the scene
      this.draw();
    }
  }

}


export default ShootThePuck;
