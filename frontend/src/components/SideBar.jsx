import Sidebar from "react-bootstrap-sidebar-menu";
import SideBarHeader from "./SideBarHeader";
import SideBarBody from "./SideBarBody";
import SideBarFooter from "./SideBarFooter";
import { useSelector } from "react-redux";

const SideBar = () => {
    const { userInfo } = useSelector((state) => state.auth);

    return (
        <>
            {userInfo ? (
                <Sidebar variant="dark" bg="dark" expand="sm">
                    <Sidebar.Collapse getScrollValue={250}>
                        <div className="sidebar-container my-sidebar">
                            <SideBarHeader />
                            <hr className="white-hr" />
                            <div className="sidebar-container">
                                <SideBarBody />
                            </div>
                            <hr className="white-hr" />
                            <SideBarFooter />
                        </div>
                    </Sidebar.Collapse>
                </Sidebar >
            ) : (
                <>
                </>
            )}
        </>

    );
};

export default SideBar;