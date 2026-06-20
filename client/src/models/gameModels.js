function Game(id, userId, startId, endId, status, score, created, time) {
    this.id = id;
    this.userId = userId;
    this.startId = startId;
    this.endId = endId;
    this.status = status;
    this.score = score;
    this.created = created;
    this.time = time;
}

export {Game}