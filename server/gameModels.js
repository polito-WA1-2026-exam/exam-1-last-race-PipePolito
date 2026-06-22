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

function Events(id, name_event, probability, score) {
    this.id = id;
    this.name_event = name_event;
    this.probability = probability;
    this.score = score;
}



export {Game, Events }