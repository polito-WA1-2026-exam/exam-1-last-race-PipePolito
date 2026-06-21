import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge, Alert, ListGroup } from "react-bootstrap";
import { startGame, getNetwork, validateRoute, submitRoute, getStations } from "../API.js";
import FeedbackContext from "../contexts/FeedbackContext.js";

const SETUP_SECONDS = 60;
export const PLANNING_SECONDS = 90;

// ── Timer ──────────────────────────────────────────────────────────────────────
function Timer({ duration, onExpire }) {
    const [remaining, setRemaining] = useState(duration);
    const intervalRef = useRef(null);
    const onExpireRef = useRef(onExpire);

    useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) { clearInterval(intervalRef.current); onExpireRef.current(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const variant = remaining <= 10 ? "danger" : remaining <= 30 ? "warning" : "success";
    return <Badge bg={variant} className="fs-5">{remaining}s</Badge>;
}

// ── Setup Phase ────────────────────────────────────────────────────────────────
function SetupPhase({ user, onReady }) {
    return (
        <div className="text-center">
            <h2 className="mb-1">Setup — Memorise the Network</h2>
            <p className="text-muted mb-2">The map disappears when the timer runs out. Remember the lines and interchanges!</p>

            <div className="d-flex justify-content-center gap-4 mb-3">
                <span><strong>Player:</strong> <Badge bg="secondary">{user ? `${user.name} ${user.surname}` : "…"}</Badge></span>
                <span><strong>Time: </strong><Timer duration={SETUP_SECONDS} onExpire={onReady} /></span>
            </div>

            <img
                src="/Network.png"
                alt="Metro network map"
                className="img-fluid border rounded shadow-sm mb-4"
                style={{ maxHeight: "60vh" }}
            />

            <div>
                <Button variant="success" size="lg" onClick={onReady}>
                    I'm Ready — Start Planning
                </Button>
            </div>
        </div>
    );
}

// ── Planning Phase ─────────────────────────────────────────────────────────────
function PlanningPhase({ game, stationNames, stations, onValidate, initialSeconds = PLANNING_SECONDS }) {
    const [picked, setPicked] = useState([]);

    const startName = stationNames[game?.startStationId] ?? '?';
    const endName   = stationNames[game?.endStationId]   ?? '?';

    const routeText = picked.length > 0
        ? picked.join(' → ')
        : 'Click a station to start your route';

    const handleSubmit = () => onValidate(picked);

    return (
        <div className="container py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Planning — Build Your Route</h2>
                <Timer duration={initialSeconds} onExpire={handleSubmit} />
            </div>

            <p className="mb-3">
                <strong>From:</strong> {startName} &nbsp;&nbsp; <strong>To:</strong> {endName}
            </p>

            {/* Station list */}
            <ListGroup className="mb-3" style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {stations.map(name => (
                    <ListGroup.Item key={name} action onClick={() => setPicked(prev => [...prev, name])}>
                        {name}
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {/* Route display */}
            <h4 className="mb-2">{routeText}</h4>

            <div className="d-flex gap-2">
                <Button variant="outline-secondary" onClick={() => setPicked(prev => prev.slice(0, -1))} disabled={picked.length === 0}>
                    ← Remove Last
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit Route
                </Button>
            </div>
        </div>
    );
}

// ── Result Phase (scaffold) ────────────────────────────────────────────────────
function ResultPhase({ result, onPlayAgain }) {
    return (
        <div className="text-center py-5">
            <h2>Result</h2>
            <p className="fs-3">Final coins: <Badge bg="warning" text="dark">{result?.finalCoins ?? 0}</Badge></p>
            <Button variant="primary" onClick={onPlayAgain}>Play Again</Button>
        </div>
    );
}

// ── Main GameLayout ────────────────────────────────────────────────────────────
export default function GameLayout({ loggedIn }) {
    const { user } = useContext(FeedbackContext);
    const [phase, setPhase] = useState('setup');       // 'setup' | 'planning' | 'execution' | 'result'
    const [game, setGame] = useState(null);            // { id, startStationId, endStationId }
    const [network, setNetwork] = useState([]);
    const [stations, setStations] = useState([]);
    const [pendingSegments, setPendingSegments] = useState(null); // built in handleValidate, consumed in execution
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [planningSecondsLeft, setPlanningSecondsLeft] = useState(PLANNING_SECONDS);
    const startTimeRef = useRef(null);
    const planningStartRef = useRef(null);
    const navigate = useNavigate();

    // Build id → name map from network data
    const stationNames = {};
    network.forEach(c => {
        stationNames[c.station1Id] = c.station1Name;
        stationNames[c.station2Id] = c.station2Name;
    });

    // Fetch the network once on mount
    useEffect(() => {
        if (!loggedIn) { navigate('/login'); return; }
        getNetwork()
            .then(net => setNetwork(net))
            .catch(e => setError(e.message));
    }, []);

    // Execution phase: segments were built in handleValidate, now submit them
    useEffect(() => {
        if (phase !== 'execution' || !pendingSegments) return;
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        submitRoute(game.id, pendingSegments, timeSpent)
            .then(res => { setResult(res); setPhase('result'); })
            .catch(e => {
                setError(e.message);
                const elapsed = Math.round((Date.now() - planningStartRef.current) / 1000);
                setPlanningSecondsLeft(Math.max(0, PLANNING_SECONDS - elapsed));
                setPhase('planning');
            });
    }, [phase, pendingSegments, game]);

    // Create the game only when the player is done studying the map
    const handleReady = async () => {
        try {
            const [g, stationList] = await Promise.all([startGame(), getStations()]);
            setGame(g);
            setStations(stationList);
            startTimeRef.current = Date.now();
            planningStartRef.current = Date.now();
            setPlanningSecondsLeft(PLANNING_SECONDS);
            setPhase('planning');
        } catch (e) {
            setError(e.message);
        }
    };

    // Called from PlanningPhase with array of station names
    const handleValidate = async (names) => {
        try {
            await validateRoute(game.id, game.startStationId, game.endStationId);

            // Build segments here so execution useEffect only needs pendingSegments
            const nameToId = {};
            Object.entries(stationNames).forEach(([id, name]) => { nameToId[name] = Number(id); });
            const connMap = {};
            network.forEach(c => {
                connMap[`${c.station1Id}-${c.station2Id}`] = c.lineId;
                connMap[`${c.station2Id}-${c.station1Id}`] = c.lineId;
            });
            const segments = names.slice(0, -1).map((name, i) => {
                const fromId = nameToId[name];
                const toId   = nameToId[names[i + 1]];
                return { fromId, toId, lineId: connMap[`${fromId}-${toId}`] };
            });

            setPendingSegments(segments);
            setPhase('execution');
        } catch (e) {
            setError(e.message);
        }
    };

    const handlePlayAgain = () => {
        setGame(null); setResult(null); setPendingSegments(null); setError('');
        setPhase('setup');
    };

    return (
        <div className="container-fluid py-3">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            {phase === 'setup'     && <SetupPhase    user={user} onReady={handleReady} />}
            {phase === 'planning'  && <PlanningPhase game={game} stationNames={stationNames} stations={stations} onValidate={handleValidate} initialSeconds={planningSecondsLeft} />}
            {phase === 'execution' && <div className="text-center py-5"><p className="fs-4">Executing your route…</p></div>}
            {phase === 'result'    && <ResultPhase   result={result} onPlayAgain={handlePlayAgain} />}
        </div>
    );
}
