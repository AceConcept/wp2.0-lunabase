import {
  LunaScaledArtboard,
  LunaSidebar,
  DEFAULT_SLIDER_ITEMS,
} from "./luna-sidebar";

function App() {
  return (
    <main className="app-shell">
      <LunaScaledArtboard>
        <LunaSidebar items={DEFAULT_SLIDER_ITEMS} />
      </LunaScaledArtboard>
    </main>
  );
}

export default App;
