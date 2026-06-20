import dayjs from 'dayjs';

import PropTypes from 'prop-types';
import {Col, Row, ListGroup, ListGroupItem} from 'react-bootstrap/';

export function RankingList(props) {

    return (
        <ListGroup id="ranking-list" variant="flush">
            {props.rankings.map((ranking, i) => <RankingInList
                key={i}
                rankingData={ranking}/>)}
        </ListGroup>
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