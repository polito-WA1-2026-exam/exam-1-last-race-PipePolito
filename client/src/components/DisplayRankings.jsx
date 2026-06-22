import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Row, ListGroup, ListGroupItem } from 'react-bootstrap/';

export function RankingList(props) {
    const navigate = useNavigate();

    return (
        <>
            <Row className="px-3 py-2 fw-bold text-muted border-bottom">
                <Col xs={6} xl={3}>Player</Col>
                <Col xs={6} xl={3} className="text-end text-xl-center">Score</Col>
                <Col xs={4} xl={3} className="text-xl-center">Date</Col>
                <Col xs={8} xl={3} className="text-end text-xl-center">Time spent</Col>
            </Row>
            <ListGroup id="ranking-list" variant="flush">
                {props.rankings.map((ranking, i) => <RankingInList
                    key={i}
                    rankingData={ranking}/>)}
            </ListGroup>
            <div className="d-flex gap-2 mb-3">
                <Button variant="outline-secondary" onClick={() => navigate('/')}>Home</Button>
                <Button variant="primary" onClick={() => navigate('/game')}>Play Game</Button>
            </div>
        </>
    );
}

RankingList.propTypes = {
    rankings: PropTypes.array.isRequired
};

export function RankingInList(props) {

    return (<ListGroupItem>
        <Row className="gy-2">
            <Col xs={6} xl={3} className="d-flex gap-2 align-items-center">
                {props.rankingData.name + " " + props.rankingData.surname}
            </Col>
            <Col xs={6} xl={3} className="text-end text-xl-center">
                {props.rankingData.final_coins} coins
            </Col>

            <Col xs={4} xl={3} className="text-xl-center">
                {props.rankingData.created_at ? dayjs(props.rankingData.created_at).format('MMMM D, YYYY') : ''}
            </Col>
            <Col xs={8} xl={3} className="text-end text-xl-center">
                {props.rankingData.time_spent != null ? `${props.rankingData.time_spent}s` : ''}
            </Col>
        </Row>
    </ListGroupItem>);
}


RankingInList.propTypes = {
    rankingData: PropTypes.object.isRequired
};