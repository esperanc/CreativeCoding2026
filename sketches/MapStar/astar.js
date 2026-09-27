class AStar {
  constructor(landPoints, start, goal, landRadius = 2) {
    if (!Number.isFinite(landRadius) || landRadius <= 0) {
      throw new Error("Land radius must be positive.");
    }

    this.connectionDistance = landRadius * 2;

    this.nodes = new Map();
    this.buckets = new Map();
    this.open = new AStarQueue();
    this.closed = new Set();

    this.costs = new Map();
    this.parents = new Map();

    this.path = [];
    this.status = "searching";

    for (const point of landPoints) {
      const key = this.key(point);

      if (this.nodes.has(key)) {
        continue;
      }

      const node = {
        x: point.x,
        y: point.y,
        key
      };

      this.nodes.set(key, node);

      const bucketKey = this.bucketKey(node);

      if (!this.buckets.has(bucketKey)) {
        this.buckets.set(bucketKey, []);
      }

      this.buckets.get(bucketKey).push(node);
    }

    this.start = this.nodes.get(this.key(start));
    this.goal = this.nodes.get(this.key(goal));

    if (!this.start || !this.goal) {
      throw new Error("Markers must belong to landPoints.");
    }

    this.costs.set(this.start.key, 0);
    this.enqueue(this.start, 0);
  }

  key(point) {
    return `${point.x.toFixed(6)},${point.y.toFixed(6)}`;
  }

  bucketKey(point) {
    const column = Math.floor(
      point.x / this.connectionDistance
    );

    const row = Math.floor(
      point.y / this.connectionDistance
    );

    return `${column},${row}`;
  }

  distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  enqueue(node, cost) {
    this.open.push({
      node,
      cost,
      priority: cost + this.distance(node, this.goal)
    });
  }

  neighbors(node) {
    const size = this.connectionDistance;
    const column = Math.floor(node.x / size);
    const row = Math.floor(node.y / size);

    const result = [];

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const bucketKey = `${column + dx},${row + dy}`;
        const bucket = this.buckets.get(bucketKey);

        if (!bucket) {
          continue;
        }

        for (const candidate of bucket) {
          if (candidate.key === node.key) {
            continue;
          }

          if (this.distance(node, candidate) <= size + 1e-9) {
            result.push(candidate);
          }
        }
      }
    }

    return result;
  }

  step() {
    if (this.status !== "searching") {
      return null;
    }

    let entry;

    while (this.open.length > 0) {
      const candidate = this.open.pop();

      if (this.closed.has(candidate.node.key)) {
        continue;
      }

      if (
        candidate.cost !== this.costs.get(candidate.node.key)
      ) {
        continue;
      }

      entry = candidate;
      break;
    }

    if (!entry) {
      this.status = "no-path";
      return null;
    }

    const current = entry.node;
    this.closed.add(current.key);

    if (current.key === this.goal.key) {
      this.status = "found";
      this.path = this.reconstruct(current);
    } else {
      for (const neighbor of this.neighbors(current)) {
        if (this.closed.has(neighbor.key)) {
          continue;
        }

        const cost =
          entry.cost + this.distance(current, neighbor);

        const previousCost =
          this.costs.get(neighbor.key) ?? Infinity;

        if (cost < previousCost) {
          this.costs.set(neighbor.key, cost);
          this.parents.set(neighbor.key, current.key);
          this.enqueue(neighbor, cost);
        }
      }

      if (this.open.length === 0) {
        this.status = "no-path";
      }
    }

    const parent = this.nodes.get(
      this.parents.get(current.key)
    );

    return {
      point: {
        x: current.x,
        y: current.y
      },
      parent: parent
        ? { x: parent.x, y: parent.y }
        : null,
      status: this.status
    };
  }

  drawStep(dotColor = "#FFF1BD", dotSize = 2) {
    const result = this.step();

    if (!result) {
      return null;
    }

    push();
    noStroke();
    fill(dotColor);
    circle(result.point.x, result.point.y, dotSize);
    pop();

    return result;
  }

  reconstruct(node) {
    const path = [];

    while (node) {
      path.push({
        x: node.x,
        y: node.y
      });

      node = this.nodes.get(
        this.parents.get(node.key)
      );
    }

    return path.reverse();
  }
}

class AStarQueue {
  constructor() {
    this.items = [];
  }

  get length() {
    return this.items.length;
  }

  push(item) {
    const items = this.items;

    items.push(item);
    let index = items.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (items[parent].priority <= item.priority) {
        break;
      }

      items[index] = items[parent];
      index = parent;
    }

    items[index] = item;
  }

  pop() {
    const items = this.items;
    const first = items[0];
    const last = items.pop();

    if (items.length === 0) {
      return first;
    }

    let index = 0;

    while (index * 2 + 1 < items.length) {
      let child = index * 2 + 1;

      if (
        child + 1 < items.length &&
        items[child + 1].priority < items[child].priority
      ) {
        child++;
      }

      if (last.priority <= items[child].priority) {
        break;
      }

      items[index] = items[child];
      index = child;
    }

    items[index] = last;
    return first;
  }
}