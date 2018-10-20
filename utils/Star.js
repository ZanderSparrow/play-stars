// --------------------------------------------------------
function star (x, y, radius1, radius2, npoints) {
  var angle = TWO_PI / npoints;
  var halfAngle = angle/2.0;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius2;
    var sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// --------------------------------------------------------
class Star {
  constructor(x, y, r1, r2, n, c) {
    // x position
    this.x = x;
    // y position
    this.y = y;
    // size
    this.r1 = r1;
    // point depth
    this.r2 = r2 || 2;
    // number of points
    this.npoints = n || 5;
    // color as an object with properties r, b, g, and o (opacity)
    this.color = c || {r: 255, g: 255, b: 200, o: 255};

    this.dead = false;
  }

  // star functions
  twinkle() {
    noStroke();
    fill(this.color);
    star(this.x, this.y, this.r1, this.r2, this.npoints);
    this.x += (random(4) - 2);
    this.y += (random(4) - 2);
    if (this.r1 >= 8) {
      this.r1--;
    } else if (this.r1 <= 2) {
      this.r1++;
    } else {
      this.r1 += random(-1, 1);
    }

  }

  draw() {
    fill(this.color.r, this.color.g, this.color.b, this.color.o);
    star(this.x, this.y, this.r1, this.r2, this.npoints);
  }

  fade() {
    if(this.color.o > 0) {
      this.color.o-= 0.2;
    } else {
      this.dead = true;
    } 
  }
}