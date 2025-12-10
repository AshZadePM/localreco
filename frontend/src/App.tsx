import { CityProvider } from './context/CityProvider';
import { QueryProvider } from './context/QueryProvider';
import { CitySelector } from './components/CitySelector';
import { QueryForm } from './components/QueryForm';
import './App.css';

function App() {
  return (
    <CityProvider>
      <QueryProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>Query Interface</h1>
            <p>Search with location and natural language</p>
          </header>

          <main className="app-main">
            <div className="form-container">
              <section className="city-section">
                <h2>Location</h2>
                <CitySelector />
              </section>

              <section className="query-section">
                <h2>Search</h2>
                <QueryForm />
              </section>
            </div>
          </main>
        </div>
      </QueryProvider>
    </CityProvider>
  );
}

export default App;
