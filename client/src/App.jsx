import { EthProvider } from "./contexts/EthContext";
import MyLittleDao from "./components/MyLittleDao";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <EthProvider>
      <div id="App">
          <MyLittleDao />
          <Footer />
      </div>
    </EthProvider>
  );
}

export default App;
