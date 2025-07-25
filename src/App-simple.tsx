import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function SimpleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">¡Sistema funcionando!</h1>
      <p>Si ves este mensaje, el frontend está cargando correctamente.</p>
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <p>Debug: Sistema básico cargado</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<SimpleTest />} />
      </Routes>
    </Router>
  );
}

export default App;
