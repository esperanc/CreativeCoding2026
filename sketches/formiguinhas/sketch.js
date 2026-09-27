// Global Simulation Configuration
        let antCount = 100;
        let antSpeed = 2.5;
        let sensorDist = 35;
        let evaporationRate = 0.0;
        let pathOpacity = 0.35;

        // Layer Toggles
        let showLiveAnts = true;
        let showPathTrails = true;
        let showPheromones = true;

        // Entities & Offscreen Graphics Buffers
        let ants = [];
        let pheromones = [];
        let nest = { x: 90, y: 390, radius: 24 };
        let food = { x: 620, y: 130, radius: 26 };
        
        let pheroGraphics; // Buffer for 10% alpha pink pheromones
        let c;  // Buffer for exact line movement trajectories of each ant

        // Simulation States
        let isLoopingVar = true;
        let isFinished = false;
        let totalPheromonesDeposited = 0;
        let totalPathStepsTracked = 0;

        class Pheromone {
            constructor(x, y, angleToFood) {
                this.x = x;
                this.y = y;
                this.angleToFood = angleToFood; // Direction pointing back to the leaf
                this.intensity = 1.0;
                this.radius = 12;
            }

            drawToGraphics(g) {
                // Pink circle with 10% opacity (25)
                g.noStroke();
                g.fill(255, 105, 180, 25 * this.intensity);
                g.circle(this.x, this.y, this.radius * 2);
            }
        }

        class Ant {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.oldX = x;
                this.oldY = y;
                this.angle = Math.random() * Math.PI * 2;
                this.hasFood = false;
                this.exited = false;
                this.size = 5.5;
                this.dropCooldown = 0;
                this.noiseOffset = Math.random() * 10000;
                this.lastFoodPos = { x: 0, y: 0 };
            }

            update() {
                if (this.exited) return;

                // Save previous location to draw line path segment
                this.oldX = this.x;
                this.oldY = this.y;

                if (!this.hasFood) {
                    // ===============================================================
                    // 1. SEARCHING STATE (Black Ant / Dumb Agent)
                    // ===============================================================
                    
                    let dToFood = Math.hypot(food.x - this.x, food.y - this.y);
                    if (dToFood < food.radius) {
                        this.hasFood = true; // Got food -> turn emerald green
                        this.lastFoodPos = { x: food.x, y: food.y };
                        // Turn directly toward Nest
                        this.angle = Math.atan2(nest.y - this.y, nest.x - this.x);
                        this.dropPheromoneDrop();
                    } else if (dToFood < sensorDist * 1.8) {
                        // Direct sight/smell to food if close
                        let targetAngle = Math.atan2(food.y - this.y, food.x - this.x);
                        this.angle = lerpAngle(this.angle, targetAngle, 0.3);
                    } else {
                        // Sense pink pheromone direction pointing towards food
                        let sensedAngle = this.sensePheromoneDirectionToFood();

                        if (sensedAngle !== null) {
                            this.angle = lerpAngle(this.angle, sensedAngle, 0.35);
                            this.angle += (Math.random() - 0.5) * 0.1;
                        } else {
                            // Dumb Agent Random Walk (Perlin Noise + Random Angular Drift)
                            this.noiseOffset += 0.04;
                            let n = noise(this.noiseOffset) - 0.5;
                            this.angle += n * 0.4 + (Math.random() - 0.5) * 0.25;
                        }
                    }

                } else {
                    // ===============================================================
                    // 2. RETURNING STATE (Green Ant Carrying Food to Nest)
                    // ===============================================================

                    let targetAngle = Math.atan2(nest.y - this.y, nest.x - this.x);
                    this.angle = lerpAngle(this.angle, targetAngle, 0.25);
                    this.angle += (Math.random() - 0.5) * 0.12;

                    // Drop pink pheromones
                    if (this.dropCooldown <= 0) {
                        this.dropPheromoneDrop();
                        this.dropCooldown = 4;
                    } else {
                        this.dropCooldown--;
                    }

                    // Check reach Nest
                    let dToNest = Math.hypot(nest.x - this.x, nest.y - this.y);
                    if (dToNest < nest.radius) {
                        this.exited = true; // Reached home, exit simulation
                    }
                }

                // Advance position
                this.x += Math.cos(this.angle) * antSpeed;
                this.y += Math.sin(this.angle) * antSpeed;

                // Bounce off canvas boundaries
                if (this.x < 10 || this.x > width - 10 || this.y < 10 || this.y > height - 10) {
                    this.angle += Math.PI + (Math.random() - 0.5);
                    this.x = constrain(this.x, 11, width - 11);
                    this.y = constrain(this.y, 11, height - 11);
                }

                if (pathGraphics) {
                    pathGraphics.push();
                    if (!this.hasFood) {
                        // Searching path segment: Subtle dark grey trajectory
                        pathGraphics.stroke(148, 163, 184, 255 * pathOpacity);
                        pathGraphics.strokeWeight(1.2);
                    } else {
                        // Carrying path segment: Vibrant emerald green line
                        pathGraphics.stroke(16, 185, 129, 255 * (pathOpacity + 0.15));
                        pathGraphics.strokeWeight(2.0);
                    }
                    pathGraphics.line(this.oldX, this.oldY, this.x, this.y);
                    pathGraphics.pop();
                    totalPathStepsTracked++;
                }
            }

            sensePheromoneDirectionToFood() {
                let totalX = 0;
                let totalY = 0;
                let count = 0;

                for (let p of pheromones) {
                    if (p.intensity <= 0.05) continue;
                    let d = Math.hypot(p.x - this.x, p.y - this.y);
                    if (d < sensorDist) {
                        let dirX = Math.cos(p.angleToFood) * p.intensity;
                        let dirY = Math.sin(p.angleToFood) * p.intensity;
                        totalX += dirX;
                        totalY += dirY;
                        count++;
                    }
                }

                if (count > 0) {
                    return Math.atan2(totalY, totalX);
                }
                return null;
            }

            dropPheromoneDrop() {
                let angleToFood = Math.atan2(this.lastFoodPos.y - this.y, this.lastFoodPos.x - this.x);
                let p = new Pheromone(this.x, this.y, angleToFood);
                pheromones.push(p);

                p.drawToGraphics(pheroGraphics);
                totalPheromonesDeposited++;
            }

            draw() {
                if (this.exited) return;

                push();
                translate(this.x, this.y);
                rotate(this.angle);

                if (!this.hasFood) {
                    // Searcher Ant Sprite (Small Black/Dark)
                    fill(15, 23, 42);
                    stroke(245, 245, 255);
                    strokeWeight(0.8);
                    circle(0, 0, this.size);
                    
                    fill(255);
                    noStroke();
                    circle(2.2, 0, 1.8);
                } else {
                    // Carrier Ant Sprite (Bright Green)
                    fill(16, 185, 129);
                    stroke(255, 255, 255);
                    strokeWeight(1.2);
                    circle(0, 0, this.size + 2);

                    fill(52, 211, 153);
                    ellipse(-2, -3, 5, 3);
                }
                pop();
            }
        }

        function lerpAngle(a, b, step) {
            let cs = (1 - step) * Math.cos(a) + step * Math.cos(b);
            let sn = (1 - step) * Math.sin(a) + step * Math.sin(b);
            return Math.atan2(sn, cs);
        }

        function setup() {
            const container = document.getElementById('canvas-container');
            let canvasWidth = Math.min(container.clientWidth, 840);
            let canvasHeight = 480;

            let canvas = createCanvas(canvasWidth, canvasHeight);
            canvas.parent('canvas-container');

            // Offscreen Buffer 1: Pink Pheromone Drops
            pheroGraphics = createGraphics(canvasWidth, canvasHeight);
            pheroGraphics.clear();

            // Offscreen Buffer 2: Ant Step Movement Trajectories (Paths)
            pathGraphics = createGraphics(canvasWidth, canvasHeight);
            pathGraphics.clear();

            nest.x = 80;
            nest.y = canvasHeight - 80;

            randomizeFoodPosition();
            resetSimulation();
        }

        function randomizeFoodPosition() {
            let minDist = Math.min(width, height) * 0.45;
            let valid = false;
            let attempts = 0;

            while (!valid && attempts < 100) {
                food.x = random(width * 0.45, width - 80);
                food.y = random(60, height * 0.7);
                let d = dist(food.x, food.y, nest.x, nest.y);
                if (d >= minDist) valid = true;
                attempts++;
            }
        }

        function resetSimulation() {
            ants = [];
            pheromones = [];
            
            for (let i = 0; i < antCount; i++) {
                let angle = random(TWO_PI);
                let r = random(nest.radius * 0.6);
                ants.push(new Ant(nest.x + cos(angle) * r, nest.y + sin(angle) * r));
            }

            pheroGraphics.clear();
            pathGraphics.clear();
            totalPheromonesDeposited = 0;
            isFinished = false;

            updateStatusBadge("Em Execução", "emerald");
            
            if (!isLoopingVar) {
                isLoopingVar = true;
                loop();
            }
        }

        function draw() {
            // Dark base canvas background
            background(15, 23, 42);

            // 1. Render Path Trajectory Buffer (Movement step lines)
            if (showPathTrails && pathGraphics) {
                image(pathGraphics, 0, 0);
            }

            // 2. Render Pheromones Buffer
            if (showPheromones && pheroGraphics) {
                image(pheroGraphics, 0, 0);
            }

            // Evaporation calculation if active
            if (evaporationRate > 0) {
                pheroGraphics.clear();
                for (let i = pheromones.length - 1; i >= 0; i--) {
                    let p = pheromones[i];
                    p.intensity -= evaporationRate * 0.05;
                    if (p.intensity <= 0) {
                        pheromones.splice(i, 1);
                    } else {
                        p.drawToGraphics(pheroGraphics);
                    }
                }
            }

            // 3. Render Nest
            push();
            fill(59, 130, 246, 35);
            noStroke();
            circle(nest.x, nest.y, nest.radius * 2.5);

            fill(30, 41, 59);
            stroke(59, 130, 246);
            strokeWeight(2.5);
            circle(nest.x, nest.y, nest.radius * 1.8);

            fill(15, 23, 42);
            noStroke();
            circle(nest.x, nest.y, nest.radius * 0.9);

            fill(148, 163, 184);
            textAlign(CENTER, CENTER);
            textSize(10);
            text("NINHO", nest.x, nest.y + nest.radius + 12);
            pop();

            // 4. Render Food Leaf
            push();
            let pulse = Math.sin(frameCount * 0.07) * 3;
            
            fill(16, 185, 129, 40);
            noStroke();
            circle(food.x, food.y, food.radius * 2.2 + pulse);

            fill(16, 185, 129);
            stroke(255, 255, 255);
            strokeWeight(2);
            circle(food.x, food.y, food.radius + pulse * 0.5);

            fill(255);
            textAlign(CENTER, CENTER);
            textSize(13);
            text("🍃", food.x, food.y);
            pop();

            // 5. Update & Draw Ants
            let searchingCount = 0;
            let carryingCount = 0;
            let exitedCount = 0;

            for (let ant of ants) {
                ant.update();
                if (showLiveAnts) {
                    ant.draw();
                }

                if (ant.exited) {
                    exitedCount++;
                } else if (ant.hasFood) {
                    carryingCount++;
                } else {
                    searchingCount++;
                }
            }

            // 6. Update UI Metrics
            let progressPct = Math.round((exitedCount / ants.length) * 100);

            document.getElementById('stat-searching').textContent = searchingCount;
            document.getElementById('stat-carrying').textContent = carryingCount;
            document.getElementById('stat-exited').textContent = exitedCount;
            document.getElementById('stat-pheromones').textContent = pheromones.length;
            document.getElementById('stat-steps').textContent = totalPathStepsTracked;
            document.getElementById('progress-percent').textContent = `${progressPct}%`;
            document.getElementById('progress-bar').style.width = `${progressPct}%`;
            document.getElementById('fps-display').textContent = `FPS: ${Math.round(frameRate())}`;

            // 6. Check Completion Condition (Silent pause without popups)
            if (exitedCount === ants.length && !isFinished && ants.length > 0) {
                isFinished = true;
                noLoop();
                isLoopingVar = false;
                updateStatusBadge("Concluído", "pink");
            }
        }

        function mousePressed() {
            if (mouseX >= 20 && mouseX <= width - 20 && mouseY >= 20 && mouseY <= height - 20) {
                if (dist(mouseX, mouseY, nest.x, nest.y) > 70) {
                    food.x = mouseX;
                    food.y = mouseY;
                    resetSimulation();
                }
            }
        }

        // Resizing window handler
        function windowResized() {
            const container = document.getElementById('canvas-container');
            let canvasWidth = Math.min(container.clientWidth, 840);
            if (canvasWidth > 0 && canvasWidth !== width) {
                resizeCanvas(canvasWidth, 480);
                
                let oldPhero = pheroGraphics;
                pheroGraphics = createGraphics(canvasWidth, 480);
                pheroGraphics.image(oldPhero, 0, 0);

                let oldPath = pathGraphics;
                pathGraphics = createGraphics(canvasWidth, 480);
                pathGraphics.image(oldPath, 0, 0);
            }
        }

        function updateStatusBadge(text, color) {
            const badge = document.getElementById('status-badge');
            const statusText = document.getElementById('status-text');
            statusText.textContent = text;

            if (color === "emerald") {
                badge.className = "px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2";
            } else if (color === "amber") {
                badge.className = "px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-2";
            } else if (color === "pink") {
                badge.className = "px-3 py-1.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/30 flex items-center gap-2";
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            
            // Ant Count Slider
            const sliderAnts = document.getElementById('slider-ant-count');
            sliderAnts.addEventListener('input', (e) => {
                antCount = parseInt(e.target.value);
                document.getElementById('val-ant-count').textContent = antCount;
                resetSimulation();
            });

            // Speed Slider
            const sliderSpeed = document.getElementById('slider-speed');
            sliderSpeed.addEventListener('input', (e) => {
                antSpeed = parseFloat(e.target.value);
                document.getElementById('val-speed').textContent = antSpeed.toFixed(1);
            });


            // Path Opacity Slider
            const sliderPathOp = document.getElementById('slider-path-opacity');
            sliderPathOp.addEventListener('input', (e) => {
                pathOpacity = parseFloat(e.target.value);
                document.getElementById('val-path-opacity').textContent = `${Math.round(pathOpacity * 100)}%`;
            });

            // Sensor Radius Slider
            const sliderSensor = document.getElementById('slider-sensor-dist');
            sliderSensor.addEventListener('input', (e) => {
                sensorDist = parseInt(e.target.value);
                document.getElementById('val-sensor-dist').textContent = sensorDist;
            });

            // Evaporation Rate Slider
            const sliderEvap = document.getElementById('slider-evaporation');
            sliderEvap.addEventListener('input', (e) => {
                evaporationRate = parseFloat(e.target.value);
                document.getElementById('val-evaporation').textContent = `${(evaporationRate * 100).toFixed(1)}%`;
            });
        });
