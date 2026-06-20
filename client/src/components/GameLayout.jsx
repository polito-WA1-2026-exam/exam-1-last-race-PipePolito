import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge, Alert } from "react-bootstrap";
import { startGame, getNetwork, submitRoute } from "../API.js";
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

// ── Planning Phase (scaffold) ──────────────────────────────────────────────────
function PlanningPhase({ game, stationNames }) {
    return (
        <div className="text-center py-5">
            <h2>Planning — Build Your Route</h2>
            <p className="text-muted">Route builder coming soon…</p>
            <p><strong>Start:</strong> {stationNames[game?.startStationId]} → <strong>End:</strong> {stationNames[game?.endStationId]}</p>
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
    const [phase, setPhase] = useState('setup');   // 'setup' | 'planning' | 'result'
    const [game, setGame] = useState(null);        // { id, startStationId, endStationId }
    const [network, setNetwork] = useState([]);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const startTimeRef = useRef(null);
    const navigate = useNavigate();

    // Build id → name map from network data
    const stationNames = {};
    network.forEach(c => {
        stationNames[c.station1Id] = c.station1Name;
        stationNames[c.station2Id] = c.station2Name;
    });

    // Fetch the network once on mount — safe to repeat (GET, no side effects)
    useEffect(() => {
        if (!loggedIn) { navigate('/login'); return; }
        getNetwork()
            .then(net => setNetwork(net))
            .catch(e => setError(e.message));
    }, []);

    // Create the game only when the player is done studying the map
    const handleReady = async () => {
        try {
            const g = await startGame();
            setGame(g);
            startTimeRef.current = Date.now();
            setPhase('planning');
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSubmit = async (segments) => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        try {
            const res = await submitRoute(game.id, segments, timeSpent);
            setResult(res);
            setPhase('result');
        } catch (e) {
            setError(e.message);
        }
    };

    const handlePlayAgain = () => {
        setGame(null); setResult(null); setError('');
        setPhase('setup');
        // network stays loaded — no need to re-fetch
    };

    return (
        <div className="container-fluid py-3">
            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            {phase === 'setup'    && <SetupPhase    user={user} onReady={handleReady} />}
            {phase === 'planning' && <PlanningPhase game={game} stationNames={stationNames} onSubmit={handleSubmit} />}
            {phase === 'result'   && <ResultPhase   result={result} onPlayAgain={handlePlayAgain} />}
        </div>
    );
}
