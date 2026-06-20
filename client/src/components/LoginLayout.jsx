import { useState } from "react";
import {Col, Row, Button, Form, Alert} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function LoginForm(props) {
    const [email, SetEmail] = useState('');
    const [password, SetPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [show, setShow] = useState(false);    
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { email, password };

        props.login(credentials)
            .then ( () => navigate( "/rules" ) )
            .catch( (err) => {
            if(err.message === "Unauthorized")
                setErrorMessage("Invalid email and/or password");
            else
                setErrorMessage(err.message);
            setShow(true);
            });
    };

    return (
        <Row className="mt-3 vh-100 justify-content-md-center">
            <Col md={4} >
                <h1 className="pb-3">Login</h1>
                <Form onSubmit={handleSubmit}>
                    <Alert
                        dismissible
                        show={show}
                        onClose={() => setShow(false)}
                        variant="danger">
                        {errorMessage}
                    </Alert>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email} placeholder="Example: john.doe@polito.it"
                            onChange={(ev) => SetEmail(ev.target.value)}
                            required={true}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password} placeholder="Enter the password."
                            onChange={(ev) => SetPassword(ev.target.value)}
                            required={true} minLength={6}
                        />
                    </Form.Group>
                    <Button className="mt-3" type="submit">Login</Button>
                </Form>
            </Col>
        </Row>
    )
}

LoginForm.propTypes = {
    login: PropTypes.func,
}

function LogoutButton(props) {
    return (
        <Button variant="outline-light" onClick={props.logout}>Logout</Button>
    )
}

LogoutButton.propTypes = {
    logout: PropTypes.func
}

function LoginButton() {
    const navigate = useNavigate();
    return (
        <Button variant="outline-light" onClick={()=> navigate('/login')}>Login</Button>
    )
}

export { LoginForm, LogoutButton, LoginButton };