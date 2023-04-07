import { EthProvider } from "./contexts/EthContext";
import MyLittleDao from "./components/MyLittleDao";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <EthProvider>
      <div id="App">
          <span> Hello !</span>
          <MyLittleDao />
          <Footer />
      </div>
    </EthProvider>
  );
}

export default App;
