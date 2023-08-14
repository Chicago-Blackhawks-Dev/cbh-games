export default class Rink {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private scaleFactor = 5
  public iceLength = 100;
  public iceWidth = 85;
  public iceLengthScale: number;
  public iceWidthScale: number;
  public goalineDistanceFromCenter = 89;
  public bluelineDistanceFromCenter = 25;
  public goalSize = 6;
  public blueLineOffset: number;
  public goalineOffset: number;
  public goalOffset: number;
  public centerIceY: number;
  public centerIceX: number;
  public boardWidth = 15;
  public faceoffCircleRadius = 15;
  public faceOffCircleOffset: number;
  public rightXPos: number;
  public leftXPos: number;
  // private goalCreaseOffset: number;


  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.iceLengthScale = (this.canvas.height - 100) / this.iceLength; // 1 unit = 1 foot
    this.iceWidthScale = this.canvas.width / this.iceWidth; // 1 unit = 1 foot
    this.centerIceY = this.canvas.height - 100;
    this.centerIceX = this.canvas.width / 2;
    this.blueLineOffset = this.iceLengthScale * this.bluelineDistanceFromCenter;
    this.goalineOffset = this.iceLengthScale * this.goalineDistanceFromCenter;
    this.goalOffset = (this.iceLengthScale * this.goalSize);
    this.faceOffCircleOffset = this.iceWidthScale * this.faceoffCircleRadius;
    this.rightXPos = (3 * this.canvas.width) / 4;
    this.leftXPos = this.canvas.width / 4;
  }

  public draw() {
    this.drawIce();
    this.drawBoards();
    this.drawRedCenterLine();
    this.drawBluelines();
    this.drawGoaline();
    this.drawGoalNet();
    this.drawGoalieCrease();
    this.faceoffCircles();
    // this.drawFaceoffSpots();
  }

  private drawStraightLineAccrossCanvas(y: number) {
    this.ctx.lineTo(this.canvas.width - 15, y);
  }

  private drawIce() {
    this.ctx.fillStyle = '#b7d3e9';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawBoards() {
    const left = 10;
    const right = this.canvas.width - 10;
    const top = 10;
    const bottom = this.canvas.height - 10;
    const radius = (right - left) / 6; // You can adjust this value for a more or less pronounced arc

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 10;
    this.ctx.beginPath();

    // Start at the top left
    this.ctx.moveTo(left, top + radius);

    // Draw the top left arc
    this.ctx.arcTo(left, top, left + radius, top, radius);

    // Draw the top right arc
    this.ctx.arcTo(right, top, right, top + radius, radius);

    // Draw the right side
    this.ctx.lineTo(right, bottom);

    // Draw the bottom side
    this.ctx.lineTo(left, bottom);

    // Draw the left side
    this.ctx.lineTo(left, top + radius);

    this.ctx.stroke();
  }

  private drawRedCenterLine() {
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.moveTo(this.boardWidth, this.centerIceY);
    this.drawStraightLineAccrossCanvas(this.centerIceY);
    this.ctx.stroke();

    // const radius = this.iceWidthScale * this.faceoffCircleRadius; // scaling the 15 feet radius

    // // Draw the circle at the center of the canvas at the given y position
    // this.ctx.moveTo(this.centerIceX + radius, this.centerIceY); // Move to the starting point of the circle
    // this.ctx.arc(this.centerIceX, this.centerIceY, radius, Math.PI, Math.PI * 2, false);
    // this.ctx.stroke(); 
  }

  private drawBluelines() {
    this.ctx.strokeStyle = '#0000ff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.boardWidth, this.centerIceY - this.blueLineOffset);
    this.drawStraightLineAccrossCanvas(this.centerIceY - this.blueLineOffset);
    this.ctx.stroke();

    this.drawFaceoffSpot(this.rightXPos,(this.centerIceY - this.blueLineOffset) + 50)
    this.drawFaceoffSpot(this.leftXPos,(this.centerIceY - this.blueLineOffset) + 50)
  }

  private drawGoaline() {
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.boardWidth + 1, (this.centerIceY - this.goalineOffset) + this.boardWidth);
    this.drawStraightLineAccrossCanvas((this.centerIceY - this.goalineOffset) + this.boardWidth);
    this.ctx.stroke();
  }

  private drawGoalNet() {
    // Assuming goal nets are represented as simple rectangles
    this.ctx.strokeStyle = '#ff0000';
    this.ctx.strokeRect(this.centerIceX - (this.goalOffset / 2), (this.centerIceY - this.goalineOffset) + this.boardWidth, this.goalOffset, -10);
  }

  private drawGoalieCrease() {
    const creaseRadius = 6;

    // Convert the crease radius to canvas scale
    const creaseRadiusInPixels = this.iceLengthScale * creaseRadius;

    // Determine the Y position of the crease's center
    const creaseCenterY = (this.centerIceY - this.goalineOffset) + this.boardWidth; // 10 is the goal net height

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    // Draw the semicircular crease
    this.ctx.arc(this.centerIceX, creaseCenterY, creaseRadiusInPixels, 0, Math.PI, false);

    this.ctx.stroke();
  }

  private faceoffCircles() {
    // You can position faceoff circles as per NHL regulation
    this.ctx.strokeStyle = '#0000ff';
    this.ctx.beginPath();

    // Create right faceoff circle
    // Y position should be adjusted based on the rink layout; update accordingly
    const yPos = this.canvas.height / 4;
    // Draw the faceoff circle using the scaled radius
    this.ctx.ellipse(this.rightXPos, yPos, this.faceOffCircleOffset, this.faceOffCircleOffset, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.ellipse(this.leftXPos, yPos, this.faceOffCircleOffset, this.faceOffCircleOffset, 0, 0, Math.PI * 2);
    this.ctx.stroke();

    this.drawFaceoffSpot(this.rightXPos, yPos);
    this.drawFaceoffSpot(this.leftXPos, yPos);
  }

  private drawFaceoffSpot(xPos: number, yPos: number) {
    // You can position faceoff spots as per NHL regulation
    this.ctx.fillStyle = '#ff0000';
    this.ctx.beginPath();
    this.ctx.arc(xPos, yPos, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

}
