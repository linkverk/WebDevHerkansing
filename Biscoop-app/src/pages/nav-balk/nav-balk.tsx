import {Link} from "react-router-dom";
import "./nav-balk.css"


function NavBalk(){

    const navItems = [
        { to: "/movie-detail", label: "Home", emoji: "🏠"},
        { to: "/ScreeningRoom", label: "Home", emoji: "🏠"},
    ];

    return (
    <div className="nav-balk">
        <div className="nav-items">
        {navItems.map((item) => (
            <Link
            key={item.to}
            to={item.to}
            title={item.label}
            className="nav-button"
            >
            <span className="nav-emoji">{item.emoji}</span>
            <span className="nav-label">{item.label}</span>
            </Link>
        ))}
        </div>
    </div>
    );

}
export default NavBalk;
