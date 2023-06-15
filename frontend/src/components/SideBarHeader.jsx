import Sidebar from "react-bootstrap-sidebar-menu";

const SideBarHeader = () => {
    return (
        <Sidebar.Header>
            <Sidebar.Brand>Bank Api</Sidebar.Brand>
            <Sidebar.Toggle />
        </Sidebar.Header>
    );
};

export default SideBarHeader;