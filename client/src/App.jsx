import { EthProvider } from "./contexts/EthContext";
import MyLittleDao from "./components/MyLittleDao";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <span> Hello !</span>
          <MyLittleDao />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
