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

function Events(id, name, prob, score) {
    this.id = id;
    this.name = name;
    this.prob = prob;
    this.score = score;
}

function Stations(id, name, interchange, connection) {
    this.id = id;
    this.name = name;
    this.interchange = interchange;
    this.connection = connection;
}

function Line(id, name, numStations) {
    this.id = id;
    this.name = name;
    this.numStations = numStations;
}


export {Game, Line, Events, Stations}