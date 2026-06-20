import { Col, Row, ListGroup, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

export function InitLayout() {
    return (
        <Row className="flex-grow-1">
            {/* Welcome message */}
            <Col className="d-flex flex-column justify-content-center align-items-center">
                <h1 className="text-center">Welcome to the Last Race!</h1>
                <p className="text-center">A game based on the board game, Race the Rails.</p>
            </Col>
            {/* Navigation buttons */}
            <Col className="d-flex flex-column justify-content-center align-items-center">
                <h2 className="text-center">Please login to start playing!</h2>
                <Link to="/login" className="btn btn-primary mt-2 my-5">Login</Link>
                <h2 className="text-center">Or see the rules of the game if you don't have a username</h2>
                <Link to="/rules" className="btn btn-secondary mt-2 my-5">See Rules</Link>
            </Col>
        </Row>
    );
}

export function RulesLayout() {
    return (
        <Row className="justify-content-center my-4">
            <Col md={8}>
                <h1 className="mb-4">How to Play — Last Race</h1>

                <h4>Objective</h4>
                <p>
                    Navigate the underground metro network from your assigned <strong>start station</strong> to
                    your <strong>destination station</strong> while keeping as many coins as possible.
                    You start with <Badge bg="warning" text="dark">20 coins</Badge>.
                </p>

                <h4 className="mt-4">Game Phases</h4>
                <ListGroup className="mb-3">
                    <ListGroup.Item>
                        <strong>1. Setup</strong> — Study the full metro map. Memorise the lines,
                        stations and connections before the planning phase begins.
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>2. Planning</strong> — The map disappears. You have <strong>90 seconds</strong> to
                        reconstruct the network from memory and build your route by selecting segments one at a time.
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>3. Execution</strong> — Your route is validated and a random event
                        occurs on each segment, adding or removing coins.
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>4. Result</strong> — See your final score and the events that happened
                        along the way. Play again to beat your best!
                    </ListGroup.Item>
                </ListGroup>

                <h4 className="mt-4">Route Rules</h4>
                <ul>
                    <li>Your route must be at least <strong>3 segments</strong> long.</li>
                    <li>Each segment must follow a valid metro line.</li>
                    <li>You can only <strong>change lines</strong> at interchange stations
                        (stations served by more than one line).</li>
                    <li>You cannot reuse the same segment twice.</li>
                </ul>

                <h4 className="mt-4">Scoring</h4>
                <p>
                    Each segment triggers a random event that can change your coin count
                    by <strong>−4 to +4 coins</strong>. Your final score is your remaining
                    coins — minimum 0, so you can never go into debt!
                </p>

                <div className="d-flex gap-3 mt-4">
                    <Link to="/" className="btn btn-outline-secondary">← Back to Home</Link>
                    <Link to="/login" className="btn btn-primary">Login to Play</Link>
                </div>
            </Col>
        </Row>
    );
}

export function NotFoundLayout() {
    return (
        <>
            <Row><Col><h2>Error: page not found!</h2></Col></Row>
            <Row>
                <Col>
                    <Link to="/" className="btn btn-primary mt-2 my-5">Go Home!</Link>
                </Col>
            </Row>
        </>
    );
}