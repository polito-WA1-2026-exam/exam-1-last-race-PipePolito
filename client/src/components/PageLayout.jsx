import { Col, Row, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

export function InitLayout({ loggedIn }) {
    return (
        <>
            {/* Welcome — top center */}
            <Row className="justify-content-center text-center mt-5 mb-4">
                <Col>
                    <h1 className="display-3 fw-bold">Welcome to the Last Race!</h1>
                    <p className="lead">A game based on the board game, Race the Rails.</p>
                </Col>
            </Row>

            {/* Two columns below */}
            <Row className="justify-content-center mt-3">
                {/* Left — login or play */}
                <Col md={4} className="d-flex flex-column align-items-center border-end py-4">
                    {loggedIn ? (
                        <>
                            <h4 className="text-center mb-3">Ready to race?</h4>
                            <p className="text-center text-muted">Your session is active. Check the ranking or jump into a game!</p>
                            <Link to="/ranking" className="btn btn-success btn-lg mt-2">Let's Play</Link>
                        </>
                    ) : (
                        <>
                            <h4 className="text-center mb-3">Ready to play?</h4>
                            <p className="text-center text-muted">Login with your account to start a game and appear in the ranking.</p>
                            <Link to="/login" className="btn btn-primary btn-lg mt-2">Login</Link>
                        </>
                    )}
                </Col>

                {/* Right — rules */}
                <Col md={4} className="d-flex flex-column align-items-center py-4">
                    <h4 className="text-center mb-3">New here?</h4>
                    <p className="text-center text-muted">Read the rules before you play — no account needed.</p>
                    <Link to="/rules" className="btn btn-outline-secondary btn-lg mt-2">See Rules</Link>
                </Col>
            </Row>
        </>
    );
}

export function RulesLayout({ loggedIn }) {
    return (
        <Row className="justify-content-center my-4">
            <Col md={8}>
                <h1 className="mb-4">How to Play — Last Race</h1>

                <h4>Objective</h4>
                <p>
                    You must plan and execute a valid route before time runs out, gaining or losing coins along the way due to random events.
                    The <strong>goal is to reach the destination with the highest possible score.</strong>
                </p>
                <p>You start with <strong>20 coins</strong>.</p>

                <h4 className="mt-4">Game Phases</h4>
                <ListGroup className="mb-3">
                    <ListGroup.Item>
                        <strong>1. Setup</strong> — Study the full metro map. Memorise the lines,
                        stations and connections before the planning phase begins. 
                        For this specific game, you have 1 minute to study the map before it disappears.
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>2. Planning</strong> — The map disappears. You have <strong>90 seconds</strong> to
                        reconstruct the network from memory and build your route by selecting segments one at a time from a list of all the available stations
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>3. Execution</strong> — Your route is validated and a random event
                        occurs on each segment, adding or removing coins.
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <strong>4. Result</strong> — See your final score and the events that happened
                        along the way. Play again to beat your best score and best time!
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
                    {loggedIn ? (
                        <Link to="/ranking" className="btn btn-success btn-lg mt-2">Let's Play</Link>
                        ): (
                        <Link to="/login" className="btn btn-primary">Login to Play</Link>) 
                    }
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