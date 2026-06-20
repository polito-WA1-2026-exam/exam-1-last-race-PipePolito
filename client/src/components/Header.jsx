import { Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function Header({ loggedIn, handleLogout }) {
    return (
        <Navbar bg="dark" variant="dark" className="px-3">
            <Container fluid>
                <Navbar.Brand as={Link} to="/">Last Race</Navbar.Brand>
                <div className="ms-auto">
                    {loggedIn && (
                        <Button variant="outline-light" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    )}
                </div>
            </Container>
        </Navbar>
    );
}

Header.propTypes = {
    loggedIn: PropTypes.bool,
    handleLogout: PropTypes.func,
};
