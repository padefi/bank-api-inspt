import Layout from "./components/Layout";
import Main from "./components/Main";
import SideBar from "./components/Sidebar";
import "./styles.scss";

const App = () => {
  return (
    <Layout>
      <SideBar />
      <Main>        
      </Main>
    </Layout>
  );
};

export default App;